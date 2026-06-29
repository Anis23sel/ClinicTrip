'use client';
import { useState } from 'react';
import {
  Building,
  Users,
  Stethoscope,
  Home,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

type Tab = 'profile' | 'doctors' | 'procedures' | 'accommodations' | 'bookings';

export default function ClinicDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Clinic Dashboard</h1>
          <p className="text-primary-foreground/80 mt-2">Istanbul Medical Center</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'profile' as Tab, label: 'Clinic Profile', icon: Building },
                  { id: 'doctors' as Tab, label: 'Doctors', icon: Users },
                  { id: 'procedures' as Tab, label: 'Procedures', icon: Stethoscope },
                  { id: 'accommodations' as Tab, label: 'Accommodations', icon: Home },
                  { id: 'bookings' as Tab, label: 'Bookings', icon: Calendar },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Clinic Profile</h2>

                <div className="bg-card rounded-lg border border-border p-6">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 font-medium">Clinic Name</label>
                        <input
                          type="text"
                          defaultValue="Istanbul Medical Center"
                          className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">Email</label>
                        <input
                          type="email"
                          defaultValue="info@istanbulmedical.com"
                          className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">Phone</label>
                        <input
                          type="tel"
                          defaultValue="+90 212 555 0123"
                          className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">Country</label>
                        <select className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring">
                          <option>Turkey</option>
                          <option>Thailand</option>
                          <option>Mexico</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">City</label>
                        <input
                          type="text"
                          defaultValue="Istanbul"
                          className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Address</label>
                      <input
                        type="text"
                        defaultValue="Nisantasi Mahallesi, Tesvikiye Caddesi No: 123, Sisli"
                        className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Description</label>
                      <textarea
                        rows={4}
                        defaultValue="Leading medical facility with over 15 years of experience in medical tourism..."
                        className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Specializations</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {['Plastic Surgery', 'Hair Transplant', 'Dental Care'].map((spec) => (
                          <span key={spec} className="px-3 py-1 bg-primary/10 text-primary rounded-lg flex items-center gap-2">
                            {spec}
                            <button type="button" className="hover:text-destructive">×</button>
                          </span>
                        ))}
                      </div>
                      <button type="button" className="text-primary hover:underline text-sm">
                        + Add specialization
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'doctors' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Doctors</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Plus size={20} />
                    Add Doctor
                  </button>
                </div>

                <div className="space-y-4">
                  {mockDoctors.map((doctor) => (
                    <div key={doctor.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold">{doctor.name}</h3>
                              <p className="text-primary">{doctor.specialization}</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                                <Edit size={18} />
                              </button>
                              <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{doctor.experience}</p>
                          <div className="flex flex-wrap gap-2">
                            {doctor.procedures.map((proc, idx) => (
                              <span key={idx} className="px-2 py-1 bg-secondary/20 text-sm rounded">
                                {proc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'procedures' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Procedures</h2>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Plus size={20} />
                    Add Procedure
                  </button>
                </div>

                <div className="space-y-4">
                  {mockProcedures.map((proc) => (
                    <div key={proc.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{proc.name}</h3>
                          <p className="text-muted-foreground text-sm">{proc.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-semibold text-lg text-primary">${proc.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{proc.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Recovery Time</p>
                          <p className="font-medium">{proc.recovery}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'accommodations' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Accommodation Partners</h2>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Plus size={20} />
                    Add Accommodation
                  </button>
                </div>

                <div className="space-y-4">
                  {mockAccommodations.map((acc) => (
                    <div key={acc.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{acc.name}</h3>
                          <p className="text-muted-foreground text-sm">{acc.distance}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Room Types</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {acc.roomTypes.map((room, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-accent/30 rounded">
                              <span>{room.type}</span>
                              <span className="font-semibold text-primary">${room.price}/night</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Booking Management</h2>

                <div className="space-y-4">
                  {clinicBookings.map((booking) => (
                    <div key={booking.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{booking.patientName}</h3>
                          <p className="text-muted-foreground">{booking.procedure}</p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.status === 'confirmed' && <CheckCircle size={16} />}
                          {booking.status === 'pending' && <Clock size={16} />}
                          <span className="capitalize">{booking.status}</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{booking.date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Doctor</p>
                          <p className="font-medium">{booking.doctor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium text-primary">${booking.price.toLocaleString()}</p>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                            Accept
                          </button>
                          <button className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all">
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const mockDoctors = [
  {
    id: 1,
    name: 'Dr. Mehmet Yilmaz',
    specialization: 'Plastic & Reconstructive Surgery',
    experience: '18 years of experience',
    procedures: ['Rhinoplasty', 'Facelift', 'Body Contouring'],
  },
  {
    id: 2,
    name: 'Dr. Ayse Demir',
    specialization: 'Hair Restoration Specialist',
    experience: '12 years of experience',
    procedures: ['FUE', 'DHI', 'Sapphire FUE'],
  },
];

const mockProcedures = [
  {
    id: 1,
    name: 'Rhinoplasty',
    category: 'Plastic Surgery',
    price: 2500,
    duration: '2-3 hours',
    recovery: '7-10 days',
  },
  {
    id: 2,
    name: 'Hair Transplant (FUE)',
    category: 'Hair Restoration',
    price: 1800,
    duration: '6-8 hours',
    recovery: '3-5 days',
  },
  {
    id: 3,
    name: 'Breast Augmentation',
    category: 'Plastic Surgery',
    price: 3200,
    duration: '1-2 hours',
    recovery: '1-2 weeks',
  },
];

const mockAccommodations = [
  {
    id: 1,
    name: 'Partner Hotel Premium',
    distance: '5 min walk from clinic',
    roomTypes: [
      { type: 'Single Room', price: 80 },
      { type: 'Double Room', price: 100 },
      { type: 'Suite', price: 150 },
    ],
  },
  {
    id: 2,
    name: 'Partner Hotel Standard',
    distance: '10 min walk from clinic',
    roomTypes: [
      { type: 'Single Room', price: 50 },
      { type: 'Double Room', price: 70 },
    ],
  },
];

const clinicBookings = [
  {
    id: 1,
    patientName: 'Sarah Martinez',
    procedure: 'Rhinoplasty',
    doctor: 'Dr. Mehmet Yilmaz',
    date: 'May 15, 2026',
    price: 2500,
    status: 'pending' as const,
  },
  {
    id: 2,
    patientName: 'John Smith',
    procedure: 'Hair Transplant',
    doctor: 'Dr. Ayse Demir',
    date: 'May 20, 2026',
    price: 1800,
    status: 'confirmed' as const,
  },
  {
    id: 3,
    patientName: 'Emma Johnson',
    procedure: 'Breast Augmentation',
    doctor: 'Dr. Mehmet Yilmaz',
    date: 'April 5, 2026',
    price: 3200,
    status: 'completed' as const,
  },
];
