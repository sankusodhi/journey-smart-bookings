import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Bus, 
  IndianRupee, 
  Coins, 
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCoinsDistributed: 0
  });
  const [buses, setBuses] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      fetchDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [usersRes, bookingsRes, coinsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_amount, booking_status'),
        supabase.from('coin_transactions').select('amount').eq('transaction_type', 'earned')
      ]);

      const totalUsers = usersRes.count || 0;
      const totalRevenue = (bookingsRes.data || [])
        .filter(b => b.booking_status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.total_amount), 0);
      const totalCoinsDistributed = (coinsRes.data || [])
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalUsers,
        totalBookings: (bookingsRes.data || []).filter(b => b.booking_status === 'confirmed').length,
        totalRevenue,
        totalCoinsDistributed
      });

      // Fetch buses
      const { data: busesData } = await supabase
        .from('buses')
        .select('*')
        .order('departure_time');

      setBuses(busesData || []);

      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!bookings_user_id_fkey(full_name, email)
        `)
        .order('booked_at', { ascending: false })
        .limit(10);

      setRecentBookings(bookingsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-journey mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-gradient-hero text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-white/80">Manage your bus booking system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Bus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Coins className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coins Distributed</p>
                <p className="text-2xl font-bold">{stats.totalCoinsDistributed}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Bus Management */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bus Management</h2>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Bus
              </Button>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {buses.map((bus) => (
                <div key={bus.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{bus.bus_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {bus.source} → {bus.destination}
                    </p>
                    <p className="text-sm">
                      ₹{bus.price} • {new Date(bus.departure_time).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Bookings */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{booking.profiles?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.profiles?.email}
                    </p>
                    <p className="text-sm">
                      Seats: {booking.selected_seats.join(', ')} • ₹{booking.total_amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.booked_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      booking.booking_status === 'confirmed' ? 'default' :
                      booking.booking_status === 'pending' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {booking.booking_status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;