import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { 
      busId, 
      selectedSeats, 
      passengerDetails, 
      contactInfo, 
      totalAmount,
      coinsUsed = 0 
    } = await req.json();

    console.log('Creating Razorpay payment for:', { busId, selectedSeats, totalAmount });

    // Create booking in Supabase first
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: user.id,
        bus_id: parseInt(busId),
        selected_seats: selectedSeats,
        passenger_details: passengerDetails,
        contact_info: contactInfo,
        total_amount: totalAmount,
        coins_used: coinsUsed,
        booking_status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      throw new Error('Failed to create booking');
    }

    // Create Razorpay order
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_abc123";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "abc456secret";
    
    const orderData = {
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      receipt: `booking_${booking.id}`,
      notes: {
        booking_id: booking.id,
        bus_id: busId,
        user_id: user.id
      }
    };

    // Create Basic Auth header for Razorpay
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      throw new Error("Failed to create Razorpay order");
    }

    const razorpayOrder = await razorpayResponse.json();

    // Update booking with Razorpay order ID
    await supabaseClient
      .from('bookings')
      .update({ payment_id: razorpayOrder.id })
      .eq('id', booking.id);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        bookingId: booking.id,
        keyId: razorpayKeyId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating Razorpay payment:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create payment" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});