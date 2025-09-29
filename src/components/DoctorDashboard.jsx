import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, MapPin, Calendar, Settings, LogOut, User } from 'lucide-react';
import { API_BASE_URL } from '@/core/constants'

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState(null);
  const [formOptions, setFormOptions] = useState({ specializations: [], clinics: [] });
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [availableTime, setAvailableTime] = useState({
    monday: { start: '', end: '', available: false },
    tuesday: { start: '', end: '', available: false },
    wednesday: { start: '', end: '', available: false },
    thursday: { start: '', end: '', available: false },
    friday: { start: '', end: '', available: false },
    saturday: { start: '', end: '', available: false },
    sunday: { start: '', end: '', available: false },
  });
  const [services, setServices] = useState([]);

  // Додаємо dayNames
  const dayNames = {
    monday: 'Понеділок',
    tuesday: 'Вівторок',
    wednesday: 'Середа',
    thursday: 'Четвер',
    friday: 'П\'ятниця',
    saturday: 'Субота',
    sunday: 'Неділя',
  };

  // --- Нормалізація часу ---
  const normalizeAvailableTime = (apiData) => {
    const base = {
      monday: { start: '', end: '', available: false },
      tuesday: { start: '', end: '', available: false },
      wednesday: { start: '', end: '', available: false },
      thursday: { start: '', end: '', available: false },
      friday: { start: '', end: '', available: false },
      saturday: { start: '', end: '', available: false },
      sunday: { start: '', end: '', available: false },
    };
    if (!apiData) return base;
    const arr = Array.isArray(apiData) ? apiData.flat() : [];
    arr.forEach((item) => {
      if (!item || !item.day) return;
      const dayKey = item.day.toLowerCase();
      if (base[dayKey]) {
        base[dayKey] = {
          start: item.from || item.from_time || '',
          end: item.to || item.to_time || '',
          available: true,
        };
      }
    });
    return base;
  };

  // --- Завантаження даних ---
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchFormOptions()]);
      await fetchDoctor();
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchFormOptions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor-options`);
      const data = await res.json();
      if (res.ok) {
        setFormOptions({
          specializations: Array.isArray(data.specializations) ? data.specializations : [],
          clinics: Array.isArray(data.clinics) ? data.clinics : [],
        });
      }
    } catch (err) {
      console.error('Error fetching form options:', err);
    }
  };

  const fetchDoctor = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Не знайдено токен авторизації');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8001/api/doctor/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.debug) setDebug(data.debug);
        setError(data.message || 'Помилка завантаження');
        setLoading(false);
        return;
      }

      setDoctor(data);
      setProfileData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      });

      // --- selectedSpecializations як масив { value, label }
      if (data.specializations) {
        setSelectedSpecializations(
          data.specializations.map((specLabel) => {
            const specOption = formOptions.specializations.find(opt => opt.label === specLabel);
            return {
              value: specOption ? specOption.value : specLabel.toLowerCase().replace(/\s+/g, '_'),
              label: specLabel
            };
          })
        );
      }

      if (data.clinics?.length) setSelectedClinicId(data.clinics[0].id);
      if (data.available_time) setAvailableTime(normalizeAvailableTime(data.available_time));
      
      // Завантажуємо існуючі послуги з фільтрацією null значень
      console.log('API Response services:', data.services);
      if (data.services && Array.isArray(data.services)) {
        // Фільтруємо null значення та додаємо дефолтні поля
        const validServices = data.services
          .filter(service => service !== null && service !== undefined)
          .map(service => ({
            id: service.id || null,
            name: service.name || '',
            specialization: service.specialization || '',
            price: service.price || 0,
            duration: service.duration || 30,
            description: service.description || '',
            is_active: service.is_active !== false
          }));
        setServices(validServices);
      } else {
        console.log('Services not found or not array:', data.services);
        setServices([]);
      }
    } catch (err) {
      setError("Помилка з'єднання з сервером");
      setLoading(false);
    }
  };

  const transformAvailableTime = () =>
    Object.entries(availableTime)
      .filter(([_, data]) => data.available && data.start && data.end)
      .map(([day, data]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        from: data.start,
        to: data.end,
      }));

  // --- Збереження профілю ---
  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Не знайдено токен авторизації');

    try {
      const res = await fetch('http://127.0.0.1:8001/api/doctor/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          specializations: selectedSpecializations.map((s) => s.label),
          available_time: transformAvailableTime(),
        }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Помилка оновлення');
      setDoctor(data);
      if (data.available_time) setAvailableTime(normalizeAvailableTime(data.available_time));
      alert('Профіль оновлено успішно!');
    } catch {
      alert("Помилка з'єднання з сервером");
    }
  };

  // --- Збереження послуг ---
  const handleSaveServices = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Не знайдено токен авторизації');

    try {
      const res = await fetch('http://127.0.0.1:8001/api/doctor/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ services }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Помилка оновлення послуг');
      setDoctor(data);
      // Безпечно обробляємо отримані послуги
      if (data.services && Array.isArray(data.services)) {
        const validServices = data.services
          .filter(service => service !== null && service !== undefined)
          .map(service => ({
            id: service.id || null,
            name: service.name || '',
            specialization: service.specialization || '',
            price: service.price || 0,
            duration: service.duration || 30,
            description: service.description || '',
            is_active: service.is_active !== false
          }));
        setServices(validServices);
      }
      alert('Послуги оновлено успішно!');
    } catch {
      alert("Помилка з'єднання з сервером");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'profile', label: 'Профіль', icon: User },
    { id: 'services', label: 'Послуги', icon: Stethoscope },
    { id: 'schedule', label: 'Розклад', icon: Calendar },
    { id: 'clinics', label: 'Клініки', icon: MapPin },
    { id: 'settings', label: 'Налаштування', icon: Settings },
  ];

  if (loading) return <div className="text-center py-12">Завантаження...</div>;
  if (error)
    return (
      <Alert variant="destructive" className="space-y-2">
        <AlertDescription>{error}</AlertDescription>
        {debug && (
          <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        )}
      </Alert>
    );
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Панель лікаря</h1>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" /> Вийти
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Особиста інформація
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                placeholder="Ім'я"
              />
              <Input
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                placeholder="Прізвище"
              />
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Email"
              />
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Телефон"
              />
              <Input
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                placeholder="Адреса"
              />
            </div>

            {/* Multi-select спеціалізацій */}
            <div>
              <label className="font-medium mb-2 block">Спеціалізації</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSpecializations.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {spec.label}
                    <button
                      onClick={() =>
                        setSelectedSpecializations(selectedSpecializations.filter((s) => s.value !== spec.value))
                      }
                      className="ml-1 font-bold text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const selectedSpec = formOptions.specializations.find(spec => spec.value === e.target.value);
                    if (selectedSpec && !selectedSpecializations.find(s => s.value === selectedSpec.value)) {
                      setSelectedSpecializations([...selectedSpecializations, selectedSpec]);
                    }
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Додати спеціалізацію</option>
                {formOptions.specializations.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSaveProfile} className="mt-4">
              Зберегти профіль
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'services' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> Послуги
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  У вас поки немає доданих послуг
                </div>
              ) : (
                services.map((service, i) => {
                  // Додаткова перевірка на випадок null/undefined
                  if (!service) {
                    console.warn(`Service at index ${i} is null/undefined`);
                    return null;
                  }
                  
                  return (
                    <div key={service.id || i} className="border rounded p-3 space-y-2">
                      <Input
                        placeholder="Назва послуги"
                        value={service.name || ''}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[i] = { ...newServices[i], name: e.target.value };
                          setServices(newServices);
                        }}
                      />

                      <select
                        value={service.specialization || ''}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[i] = { ...newServices[i], specialization: e.target.value };
                          setServices(newServices);
                        }}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Оберіть спеціалізацію</option>
                        {selectedSpecializations.length > 0 ? (
                          selectedSpecializations.map((spec) => (
                            <option key={spec.value} value={spec.value}>
                              {spec.label}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            У лікаря немає спеціалізацій
                          </option>
                        )}
                      </select>

                      <Input
                        type="number"
                        placeholder="Ціна"
                        value={service.price || ''}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[i] = { ...newServices[i], price: parseFloat(e.target.value) || 0 };
                          setServices(newServices);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Тривалість (хв)"
                        value={service.duration || ''}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[i] = { ...newServices[i], duration: parseInt(e.target.value) || 0 };
                          setServices(newServices);
                        }}
                      />
                      <Input
                        placeholder="Опис"
                        value={service.description || ''}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[i] = { ...newServices[i], description: e.target.value };
                          setServices(newServices);
                        }}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={service.is_active !== false}
                          onChange={(e) => {
                            const newServices = [...services];
                            newServices[i] = { ...newServices[i], is_active: e.target.checked };
                            setServices(newServices);
                          }}
                        />
                        Активна
                      </label>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setServices(services.filter((_, idx) => idx !== i))}
                      >
                        Видалити
                      </Button>
                    </div>
                  );
                })
              )}

              <Button
                onClick={() =>
                  setServices([
                    ...services,
                    { name: '', specialization: '', price: 0, duration: 30, description: '', is_active: true },
                  ])
                }
              >
                Додати послугу
              </Button>

              <Button onClick={handleSaveServices} className="mt-4">
                Зберегти послуги
              </Button>
            </CardContent>
          </Card>
        )}
      {/* Schedule */}
      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Розклад роботи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">Клініка</label>
              {doctor?.clinics?.length > 0 ? (
                <select
                  className="w-full p-2 border rounded"
                  value={selectedClinicId || ''}
                  onChange={(e) => setSelectedClinicId(Number(e.target.value))}
                >
                  <option value="">Оберіть клініку</option>
                  {doctor.clinics.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} {cl.address ? `— ${cl.address}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-500">У вас немає клінік. Додайте клініку щоб зберегти розклад.</p>
              )}
            </div>
            {Object.entries(dayNames).map(([dayKey, dayLabel]) => (
              <div key={dayKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">{dayLabel}</label>
                  <input
                    type="checkbox"
                    checked={availableTime[dayKey]?.available || false}
                    onChange={(e) =>
                      setAvailableTime({
                        ...availableTime,
                        [dayKey]: { ...availableTime[dayKey], available: e.target.checked },
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>
                {availableTime[dayKey]?.available && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Початок</label>
                      <Input
                        type="time"
                        value={availableTime[dayKey]?.start || ''}
                        onChange={(e) =>
                          setAvailableTime({
                            ...availableTime,
                            [dayKey]: { ...availableTime[dayKey], start: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Кінець</label>
                      <Input
                        type="time"
                        value={availableTime[dayKey]?.end || ''}
                        onChange={(e) =>
                          setAvailableTime({
                            ...availableTime,
                            [dayKey]: { ...availableTime[dayKey], end: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile}>Зберегти розклад</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAvailableTime(normalizeAvailableTime(doctor?.available_time || doctor?.schedule || []));
                }}
              >
                Скасувати зміни
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinics */}
      {activeTab === 'clinics' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Мої клініки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doctor?.clinics?.length > 0 ? (
              doctor.clinics.map((clinic) => (
                <div key={clinic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{clinic.name}</p>
                    {clinic.address && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {clinic.address}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Редагувати
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">У вас поки немає прив'язаних клінік</p>
            )}
            <Button className="w-full">Додати клініку</Button>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Налаштування
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Безпека</h3>
                <Button variant="outline">Змінити пароль</Button>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Сповіщення</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Email сповіщення про нові записи
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    SMS нагадування
                  </label>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Аккаунт</h3>
                <Button variant="destructive" onClick={handleLogout}>
                  Видалити аккаунт
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorDashboard;