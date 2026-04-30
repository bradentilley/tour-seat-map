import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const SALESPEOPLE = ['Chelsy', 'Marcie', 'Vanessa'];
const TOTAL_ROWS = 13;

const TIER = {
  1: { price: 217, color: '#c9a84c', bg: 'rgba(201,168,76,0.15)', label: '$217' },
  2: { price: 167, color: '#5b8dee', bg: 'rgba(91,141,238,0.15)', label: '$167' },
  3: { price: 97,  color: '#3ecf8e', bg: 'rgba(62,207,142,0.15)', label: '$97'  },
};

// ── Seat ─────────────────────────────────────────────────────────────────────
function Seat({ row, col, booking, onClick }) {
  const isPremium = row <= 3;
  const tier = TIER[row];

  if (!isPremium) {
    return (
      <div style={{
        width: 46, height: 46, borderRadius: 7,
        background: '#0d0f14', border: '1px solid #1a1f2a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        <div style={{ fontSize: '0.38rem', color: '#252a35', letterSpacing: '0.5px' }}>{row}{col}</div>
        <div style={{ fontSize: '0.65rem', color: '#252a35', fontWeight: 700, lineHeight: 1 }}>✕</div>
      </div>
    );
  }

  const isBooked = !!booking;
  return (
    <div
      onClick={() => onClick({ row, col, booking })}
      style={{
        width: 46, height: 46, borderRadius: 7, cursor: 'pointer',
        background: isBooked ? `${tier.color}20` : tier.bg,
        border: `1.5px solid ${isBooked ? tier.color : tier.color + '50'}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2,
        transition: 'all 0.12s',
        boxShadow: isBooked ? `0 0 0 1px ${tier.color}30` : 'none',
      }}>
      <div style={{ fontSize: '0.42rem', color: isBooked ? tier.color : tier.color + 'aa', fontWeight: 600, letterSpacing: '0.5px' }}>
        {row}{col}
      </div>
      {isBooked ? (
        <div style={{ fontSize: '0.38rem', color: tier.color, fontWeight: 700, maxWidth: 38, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', padding: '0 2px' }}>
          {booking.guest_name.split(' ')[0]}
        </div>
      ) : (
        <div style={{ fontSize: '0.46rem', color: tier.color + 'bb' }}>{tier.label}</div>
      )}
    </div>
  );
}

// ── Bus Map ───────────────────────────────────────────────────────────────────
function BusMap({ bookings, onSeatClick }) {
  const bookingMap = {};
  bookings.forEach(b => { bookingMap[`${b.row_number}${b.seat_letter}`] = b; });

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Front cap */}
      <div style={{ width: 236, background: '#161921', border: '1px solid #252a35', borderRadius: '20px 20px 0 0', padding: '10px 0', textAlign: 'center', borderBottom: 'none' }}>
        <div style={{ fontSize: '0.48rem', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>▲ Front · Driver</div>
      </div>

      {/* Grid */}
      <div style={{ background: '#161921', border: '1px solid #252a35', borderTop: 'none', borderBottom: 'none', padding: '8px 12px' }}>
        {/* Column labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '46px 46px 18px 46px 46px 22px', gap: 4, marginBottom: 6 }}>
          {['A', 'B', '', 'C', 'D', ''].map((c, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '0.48rem', color: '#6b7280', letterSpacing: '1px' }}>{c}</div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map(row => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: '46px 46px 18px 46px 46px 22px', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <Seat row={row} col="A" booking={bookingMap[`${row}A`]} onClick={onSeatClick} />
            <Seat row={row} col="B" booking={bookingMap[`${row}B`]} onClick={onSeatClick} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 46 }}>
              <div style={{ width: 2, height: '80%', background: '#1a1f2a', borderRadius: 1 }} />
            </div>
            <Seat row={row} col="C" booking={bookingMap[`${row}C`]} onClick={onSeatClick} />
            <Seat row={row} col="D" booking={bookingMap[`${row}D`]} onClick={onSeatClick} />
            <div style={{ fontSize: '0.42rem', color: row <= 3 ? TIER[row].color + '88' : '#252a35', textAlign: 'left', paddingLeft: 3 }}>
              {row}
            </div>
          </div>
        ))}
      </div>

      {/* Rear cap */}
      <div style={{ width: 236, background: '#161921', border: '1px solid #252a35', borderRadius: '0 0 20px 20px', padding: '10px 0', textAlign: 'center', borderTop: 'none' }}>
        <div style={{ fontSize: '0.48rem', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>▼ Rear</div>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ seat, booking, onBook, onCancel, onClose }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [soldBy, setSoldBy]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const tier = TIER[seat.row];
  const rowLabel = seat.row === 1 ? 'Front Row' : seat.row === 2 ? 'Second Row' : 'Third Row';

  async function handleBook() {
    if (!name.trim() || !email.trim() || !soldBy) {
      setError('Please fill in all fields and select a salesperson.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await onBook({ name: name.trim(), email: email.trim(), soldBy });
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  async function handleCancel() {
    setLoading(true);
    await onCancel(booking.id);
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#161921', border: '1px solid #252a35', borderRadius: 16, padding: 28, width: 380, maxWidth: '92vw' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 9, background: tier.bg, border: `1.5px solid ${tier.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: tier.color, lineHeight: 1 }}>{seat.row}{seat.col}</div>
            <div style={{ fontSize: '0.5rem', color: tier.color + '99', marginTop: 2 }}>{tier.label}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#e8e4d9' }}>Seat {seat.row}{seat.col}</div>
            <div style={{ fontSize: '0.6rem', color: tier.color, marginTop: 2 }}>{rowLabel} · ${tier.price}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6b7280', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {booking ? (
          <>
            <div style={{ background: '#0d0f14', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: '0.48rem', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Current Booking</div>
              <div style={{ fontSize: '0.9rem', color: '#e8e4d9', fontWeight: 600, marginBottom: 3 }}>{booking.guest_name}</div>
              <div style={{ fontSize: '0.65rem', color: '#a0aab8', marginBottom: 10 }}>{booking.guest_email}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#6b7280' }}>
                <span>Sold by <span style={{ color: '#c9a84c' }}>{booking.salesperson}</span></span>
                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={handleCancel} disabled={loading}
              style={{ width: '100%', padding: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: 8, color: '#f87171', fontSize: '0.7rem', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
              {loading ? 'Cancelling…' : 'Cancel Booking & Free Seat'}
            </button>
            <button onClick={onClose}
              style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid #252a35', borderRadius: 8, color: '#6b7280', fontSize: '0.68rem', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Close
            </button>
          </>
        ) : (
          <>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '9px 13px', fontSize: '0.67rem', color: '#f87171', marginBottom: 12, lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.52rem', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5 }}>Guest Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                onKeyDown={e => e.key === 'Enter' && handleBook()}
                style={{ width: '100%', background: '#0d0f14', border: '1px solid #252a35', borderRadius: 8, padding: '9px 12px', color: '#e8e4d9', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.52rem', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5 }}>Email</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                onKeyDown={e => e.key === 'Enter' && handleBook()}
                style={{ width: '100%', background: '#0d0f14', border: '1px solid #252a35', borderRadius: 8, padding: '9px 12px', color: '#e8e4d9', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.52rem', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Sold By</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {SALESPEOPLE.map(s => (
                  <button key={s} onClick={() => setSoldBy(s)}
                    style={{ flex: 1, padding: '9px 4px', background: soldBy === s ? 'rgba(201,168,76,0.15)' : 'transparent', border: `1px solid ${soldBy === s ? 'rgba(201,168,76,0.5)' : '#252a35'}`, borderRadius: 7, color: soldBy === s ? '#c9a84c' : '#6b7280', fontSize: '0.67rem', cursor: 'pointer', transition: 'all 0.1s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleBook} disabled={loading}
              style={{ width: '100%', padding: '11px', background: loading ? 'rgba(201,168,76,0.05)' : 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 8, color: loading ? '#6b7280' : '#c9a84c', fontSize: '0.7rem', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
              {loading ? 'Booking…' : `Confirm Booking · $${tier.price}`}
            </button>
            <button onClick={onClose}
              style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid #252a35', borderRadius: 8, color: '#6b7280', fontSize: '0.68rem', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Bus View ──────────────────────────────────────────────────────────────────
function BusView({ tour, bookings, activeBus, setActiveBus, onBack, onSeatClick }) {
  const busBookings    = bookings.filter(b => b.bus_number === activeBus);
  const premiumBooked  = busBookings.filter(b => b.row_number <= 3).length;
  const revenue        = busBookings.filter(b => b.row_number <= 3).reduce((s, b) => s + TIER[b.row_number].price, 0);

  return (
    <div style={{ minHeight: '100vh', padding: '24px 24px 56px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={onBack}
            style={{ background: 'transparent', border: '1px solid #252a35', borderRadius: 7, padding: '7px 13px', color: '#6b7280', fontSize: '0.6rem', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0 }}>
            ← Tours
          </button>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem', color: '#c9a84c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tour.name}
          </div>
        </div>

        {/* Bus tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[1, ...(tour.has_bus2 ? [2] : [])].map(bus => (
            <button key={bus} onClick={() => setActiveBus(bus)}
              style={{ padding: '8px 22px', background: activeBus === bus ? 'rgba(201,168,76,0.15)' : 'transparent', border: `1px solid ${activeBus === bus ? 'rgba(201,168,76,0.5)' : '#252a35'}`, borderRadius: 8, color: activeBus === bus ? '#c9a84c' : '#6b7280', fontSize: '0.65rem', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.12s' }}>
              Bus {bus}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
          {[
            { label: 'Premium Booked', value: `${premiumBooked} / 12`, color: '#c9a84c' },
            { label: 'Available',      value: 12 - premiumBooked,       color: '#3ecf8e' },
            { label: 'Revenue',        value: `$${revenue.toLocaleString()}`, color: '#5b8dee' },
          ].map(c => (
            <div key={c.label} style={{ background: '#161921', border: '1px solid #252a35', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.48rem', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
          {Object.entries(TIER).map(([row, t]) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: t.color }} />
              <span style={{ fontSize: '0.53rem', color: '#6b7280' }}>Row {row} · {t.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#252a35' }} />
            <span style={{ fontSize: '0.53rem', color: '#6b7280' }}>Rows 4–13 · GA</span>
          </div>
        </div>

        {/* Seat map */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BusMap bookings={busBookings} onSeatClick={onSeatClick} />
        </div>
      </div>
    </div>
  );
}

// ── Tour List ─────────────────────────────────────────────────────────────────
function TourList({ tours, onSelectTour, onCreateTour, onToggleBus2 }) {
  const [newName, setNewName]   = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    setCreateError('');
    const err = await onCreateTour(newName.trim());
    if (err) setCreateError(err);
    else setNewName('');
    setCreating(false);
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', color: '#c9a84c', marginBottom: 4, lineHeight: 1 }}>Tour Seat Manager</div>
        <div style={{ fontSize: '0.58rem', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>Premium Front Seat Bookings</div>
      </div>

      {createError && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: '0.67rem', color: '#f87171', marginBottom: 12, lineHeight: 1.5, wordBreak: 'break-all' }}>
          {createError}
        </div>
      )}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Tour name (e.g. Israel June 2027)"
          style={{ flex: 1, background: '#161921', border: '1px solid #252a35', borderRadius: 8, padding: '10px 14px', color: '#e8e4d9', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none' }} />
        <button type="submit" disabled={creating || !newName.trim()}
          style={{ background: creating || !newName.trim() ? 'transparent' : 'rgba(201,168,76,0.12)', border: `1px solid ${creating || !newName.trim() ? '#252a35' : 'rgba(201,168,76,0.4)'}`, borderRadius: 8, padding: '10px 18px', color: creating || !newName.trim() ? '#374151' : '#c9a84c', fontSize: '0.68rem', cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {creating ? 'Adding…' : '+ Add Tour'}
        </button>
      </form>

      {tours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#374151', fontSize: '0.7rem' }}>
          No tours yet — add one above
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tours.map(tour => (
            <div key={tour.id} style={{ background: '#161921', border: '1px solid #252a35', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => onSelectTour(tour)}>
                <div style={{ fontSize: '0.85rem', color: '#e8e4d9', fontWeight: 600, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tour.name}
                </div>
                <div style={{ fontSize: '0.56rem', color: '#6b7280', letterSpacing: '1px' }}>
                  {tour.has_bus2 ? '2 buses · 24 premium seats' : '1 bus · 12 premium seats'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <span style={{ fontSize: '0.55rem', color: '#6b7280' }}>Bus 2</span>
                <div onClick={() => onToggleBus2(tour)}
                  style={{ width: 36, height: 20, borderRadius: 10, background: tour.has_bus2 ? '#c9a84c' : '#252a35', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: tour.has_bus2 ? 19 : 3, transition: 'left 0.2s' }} />
                </div>
              </div>

              <button onClick={() => onSelectTour(tour)}
                style={{ background: 'rgba(91,141,238,0.1)', border: '1px solid rgba(91,141,238,0.3)', borderRadius: 6, padding: '7px 14px', color: '#5b8dee', fontSize: '0.6rem', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]                 = useState('tours');
  const [tours, setTours]               = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [activeBus, setActiveBus]       = useState(1);
  const [bookings, setBookings]         = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [appLoading, setAppLoading]     = useState(true);

  useEffect(() => {
    supabase.from('tours').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { setTours(data || []); setAppLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedTour) return;

    async function loadBookings() {
      const { data } = await supabase.from('bookings').select('*')
        .eq('tour_id', selectedTour.id).eq('status', 'active');
      setBookings(data || []);
    }

    loadBookings();

    const channel = supabase
      .channel(`tour-${selectedTour.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `tour_id=eq.${selectedTour.id}` },
        () => loadBookings())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTour]);

  async function handleCreateTour(name) {
    const { data, error } = await supabase.from('tours').insert({ name }).select().single();
    if (error) return `${error.message} (code: ${error.code})`;
    if (data) setTours(prev => [...prev, data]);
  }

  async function handleToggleBus2(tour) {
    const { data, error } = await supabase.from('tours').update({ has_bus2: !tour.has_bus2 }).eq('id', tour.id).select().single();
    if (error) { console.error('Toggle bus2 failed:', error); return; }
    if (data) {
      setTours(prev => prev.map(t => t.id === tour.id ? data : t));
      if (selectedTour?.id === tour.id) setSelectedTour(data);
    }
  }

  async function handleBook({ name, email, soldBy }) {
    const { row, col } = selectedSeat;
    const { error } = await supabase.from('bookings').insert({
      tour_id: selectedTour.id, bus_number: activeBus,
      row_number: row, seat_letter: col,
      guest_name: name, guest_email: email,
      salesperson: soldBy, status: 'active',
    });
    if (error) {
      if (error.code === '23505') return { error: 'This seat was just booked by someone else. Please choose another.' };
      return { error: `Booking failed: ${error.message} (${error.code})` };
    }
    setSelectedSeat(null);
    return { success: true };
  }

  async function handleCancelBooking(bookingId) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    setSelectedSeat(null);
  }

  const selectedSeatBooking = selectedSeat
    ? bookings.find(b => b.row_number === selectedSeat.row && b.seat_letter === selectedSeat.col && b.bus_number === activeBus)
    : null;

  if (appLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0f14', color: '#6b7280', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '2px' }}>
        LOADING…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', color: '#e8e4d9', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      {view === 'tours' ? (
        <TourList tours={tours} onSelectTour={t => { setSelectedTour(t); setActiveBus(1); setBookings([]); setView('bus'); }}
          onCreateTour={handleCreateTour} onToggleBus2={handleToggleBus2} />
      ) : (
        <BusView tour={selectedTour} bookings={bookings} activeBus={activeBus} setActiveBus={setActiveBus}
          onBack={() => { setView('tours'); setSelectedTour(null); setBookings([]); setSelectedSeat(null); }}
          onSeatClick={({ row, col, booking }) => { if (row > 3) return; setSelectedSeat({ row, col, booking }); }} />
      )}
      {selectedSeat && (
        <BookingModal seat={selectedSeat} booking={selectedSeatBooking}
          onBook={handleBook} onCancel={handleCancelBooking} onClose={() => setSelectedSeat(null)} />
      )}
    </div>
  );
}
