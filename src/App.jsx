import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Star, 
  Clock, 
  ChevronLeft, 
  Info, 
  CheckCircle2, 
  X,
  Ticket,
  Loader2
} from 'lucide-react';

// --- API Configuration ---
const API_KEY = "ba5e2748d7df42cab33e99e177a6c088";
const API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

// --- Mock Data for Theatres (Kept constant) ---
const THEATRES = [
  { id: 't1', name: "PVR: Orion Mall, Bengaluru", times: ["10:30 AM", "01:45 PM", "05:00 PM", "09:30 PM"] },
  { id: 't2', name: "INOX: Garuda Mall, Magrath Road", times: ["11:00 AM", "03:15 PM", "07:00 PM", "10:45 PM"] },
  { id: 't3', name: "Cinepolis: Forum Mall, Koramangala", times: ["09:00 AM", "12:30 PM", "04:00 PM", "08:15 PM"] }
];

const SEAT_PRICE = 250;
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

// Simple Genre Map for common TMDB IDs
const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch movies");
        const data = await response.json();
        
        // Map TMDB data to our app's expected format
        const formattedMovies = data.results.map(m => ({
          id: m.id,
          title: m.title,
          rating: `${m.vote_average.toFixed(1)}/10`,
          votes: m.vote_count > 1000 ? `${(m.vote_count / 1000).toFixed(1)}K` : m.vote_count,
          duration: "2h 15m", // TMDB main list doesn't include duration, using default
          genre: m.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 2).join(", ") || "Drama",
          description: m.overview,
          poster: `${IMAGE_BASE_URL}${m.poster_path}`,
          banner: `${BACKDROP_BASE_URL}${m.backdrop_path || m.poster_path}`,
          releaseDate: m.release_date
        }));
        
        setMovies(formattedMovies);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Generate random occupied seats when theatre/time changes
  useEffect(() => {
    if (selectedTime) {
      const occupied = [];
      ROWS.forEach(row => {
        COLS.forEach(col => {
          if (Math.random() < 0.25) occupied.push(`${row}${col}`);
        });
      });
      setOccupiedSeats(occupied);
      setSelectedSeats([]);
    }
  }, [selectedTime, selectedMovie]);

  // Navigation functions
  const goToMovie = (movie) => {
    setSelectedMovie(movie);
    setCurrentPage('details');
    window.scrollTo(0, 0);
  };

  const goToTheatre = () => {
    setCurrentPage('theatre');
    window.scrollTo(0, 0);
  };

  const goToSeats = (theatre, time) => {
    setSelectedTheatre(theatre);
    setSelectedTime(time);
    setCurrentPage('seats');
    window.scrollTo(0, 0);
  };

  const confirmBooking = () => {
    setCurrentPage('confirmation');
    window.scrollTo(0, 0);
  };

  const resetApp = () => {
    setCurrentPage('home');
    setSelectedMovie(null);
    setSelectedTheatre(null);
    setSelectedTime(null);
    setSelectedSeats([]);
  };

  // --- Sub-Components ---

  const Header = () => (
    <nav className="bg-white border-b sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6 flex-1">
        <h1 
          className="text-2xl font-bold text-rose-500 cursor-pointer whitespace-nowrap"
          onClick={resetApp}
        >
          book<span className="text-zinc-800">my</span>show
        </h1>
        <div className="hidden md:flex items-center border rounded-md px-3 py-1.5 bg-zinc-50 flex-1 max-w-md">
          <Search size={18} className="text-zinc-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search for Movies, Events, Plays and more" 
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center text-zinc-600 cursor-pointer hover:text-rose-500">
          <span className="text-sm font-medium mr-1">Bengaluru</span>
          <MapPin size={16} />
        </div>
        <button className="bg-rose-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-rose-600">
          Sign In
        </button>
      </div>
    </nav>
  );

  // --- Views ---

  const HomePage = () => (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Now Showing</h2>
        <button className="text-rose-500 text-sm font-medium flex items-center">
          See All <ChevronRight size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p>Loading latest blockbusters...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-rose-500 font-medium mb-4">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-sm underline">Try Again</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => (
            <div 
              key={movie.id} 
              className="group cursor-pointer transition-transform hover:-translate-y-1"
              onClick={() => goToMovie(movie)}
            >
              <div className="aspect-[2/3] bg-zinc-200 rounded-xl overflow-hidden mb-3 relative shadow-sm border border-zinc-200">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-2 flex items-center justify-between">
                   <div className="flex items-center text-xs gap-1">
                      <Star size={12} fill="currentColor" className="text-rose-500 border-none" />
                      <span className="font-bold">{movie.rating}</span>
                   </div>
                   <span className="text-[10px] text-zinc-300">{movie.votes} Votes</span>
                </div>
              </div>
              <h3 className="font-semibold text-zinc-800 truncate leading-tight mb-1">{movie.title}</h3>
              <p className="text-xs text-zinc-500">{movie.genre}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const MovieDetailsPage = () => (
    <div className="animate-in fade-in duration-300">
      <div className="relative min-h-[350px] md:h-[480px] w-full bg-zinc-950 flex items-center overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src={selectedMovie.banner} 
            alt="backdrop" 
            className="w-full h-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start z-10 w-full max-w-6xl mx-auto px-4 py-8 md:py-0">
          <div className="w-48 md:w-72 flex-shrink-0 aspect-[2/3] bg-zinc-800 rounded-xl overflow-hidden shadow-2xl border border-white/10">
             <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-full h-full object-cover" />
          </div>
          <div className="text-white flex-1 text-center md:text-left mt-4 md:mt-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{selectedMovie.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <div className="flex items-center bg-zinc-800/90 px-3 py-1.5 rounded-lg text-sm border border-zinc-700">
                <Star size={16} fill="currentColor" className="text-rose-500 mr-2" />
                <span className="font-bold">{selectedMovie.rating}</span>
                <span className="ml-2 text-zinc-400">({selectedMovie.votes} votes)</span>
              </div>
              <span className="text-zinc-300 text-sm px-2 py-1 bg-white/10 rounded uppercase tracking-wider">{selectedMovie.releaseDate?.split('-')[0]}</span>
              <span className="text-zinc-300 text-sm flex items-center gap-1">
                <Clock size={14} /> {selectedMovie.duration}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
              {selectedMovie.genre.split(',').map(g => (
                <span key={g} className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-tighter">
                  {g.trim()}
                </span>
              ))}
            </div>
            <button 
              onClick={goToTheatre}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-12 rounded-lg transition-all shadow-lg active:scale-95 w-full md:w-auto"
            >
              Book tickets
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-8">
        <h3 className="text-xl font-bold mb-4 text-zinc-800">About the movie</h3>
        <p className="text-zinc-600 leading-relaxed max-w-4xl text-lg">
          {selectedMovie.description}
        </p>
      </div>
    </div>
  );

  const TheatrePage = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentPage('details')} className="hover:bg-zinc-100 p-2 rounded-full transition-colors">
          <ChevronLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">{selectedMovie.title}</h2>
          <p className="text-sm text-zinc-500">{selectedMovie.genre} | {selectedMovie.releaseDate}</p>
        </div>
      </div>

      <div className="space-y-6">
        {THEATRES.map(theatre => (
          <div key={theatre.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 border-b bg-zinc-50 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-800 flex items-center gap-2">
                <Info size={16} className="text-zinc-400" />
                {theatre.name}
              </h3>
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">M-Ticket available</span>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {theatre.times.map(time => (
                <button
                  key={time}
                  onClick={() => goToSeats(theatre.name, time)}
                  className="border border-zinc-200 rounded-md px-6 py-2 text-sm font-medium text-green-600 hover:border-green-600 hover:bg-green-50 transition-all active:scale-95"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SeatSelectionPage = () => {
    const handleSeatClick = (seat) => {
      if (occupiedSeats.includes(seat)) return;
      setSelectedSeats(prev => 
        prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
      );
    };

    const totalPrice = selectedSeats.length * SEAT_PRICE;

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in zoom-in-95">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-800">{selectedMovie.title}</h2>
            <p className="text-zinc-500 text-sm font-medium">{selectedTheatre} | {selectedTime}</p>
          </div>
          <button 
            onClick={() => setCurrentPage('theatre')}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Screen UI */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-full max-w-md h-1.5 bg-zinc-300 rounded-full shadow-[0_12px_24px_-2px_rgba(0,0,0,0.2)] mb-2"></div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">All eyes this way please!</p>
        </div>

        {/* Seat Grid */}
        <div className="flex flex-col items-center gap-4 mb-12 select-none overflow-x-auto pb-4">
          {ROWS.map(row => (
            <div key={row} className="flex gap-3 items-center">
              <span className="w-4 text-xs font-bold text-zinc-400">{row}</span>
              {COLS.map(col => {
                const seatId = `${row}${col}`;
                const isOccupied = occupiedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                
                return (
                  <button
                    key={col}
                    disabled={isOccupied}
                    onClick={() => handleSeatClick(seatId)}
                    className={`
                      w-8 h-8 rounded-sm text-[10px] font-medium transition-all duration-200
                      ${isOccupied ? 'bg-zinc-200 text-zinc-200 cursor-not-allowed' : 
                        isSelected ? 'bg-rose-500 text-white shadow-md scale-110' : 
                        'border border-zinc-300 text-zinc-400 hover:border-rose-400 hover:text-rose-500 hover:scale-105'}
                    `}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 mb-12 border-t pt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-zinc-300"></div>
            <span className="text-xs text-zinc-500 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-rose-500"></div>
            <span className="text-xs text-zinc-500 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-zinc-200"></div>
            <span className="text-xs text-zinc-500 font-medium">Occupied</span>
          </div>
        </div>

        {/* Checkout Bar */}
        {selectedSeats.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-full duration-300">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Seats: <span className="text-zinc-900">{selectedSeats.join(', ')}</span></p>
                <p className="text-xl font-black text-zinc-800">₹{totalPrice}</p>
              </div>
              <button 
                onClick={confirmBooking}
                className="bg-rose-500 text-white font-bold px-12 py-3.5 rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ConfirmationPage = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>
      <h2 className="text-3xl font-black text-zinc-800 mb-2">Booking Confirmed!</h2>
      <p className="text-zinc-500 mb-8 font-medium">Your e-ticket has been sent to your registered email.</p>
      
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 w-full max-w-md text-left mb-8 shadow-sm">
        <div className="flex gap-4 mb-4 pb-4 border-b">
           <div className="w-20 h-28 bg-zinc-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
             <img src={selectedMovie.poster} alt="poster" className="w-full h-full object-cover" />
           </div>
           <div className="flex flex-col justify-center">
              <h3 className="font-bold text-lg text-zinc-800 leading-tight mb-1">{selectedMovie.title}</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{selectedMovie.genre}</p>
              <p className="text-xs text-zinc-400 mt-2 italic">Language: English (2D)</p>
           </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Theatre</span>
            <span className="font-bold text-zinc-800">{selectedTheatre.split(':')[0]}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Showtime</span>
            <span className="font-bold text-zinc-800">{selectedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Seats</span>
            <span className="font-bold text-zinc-800">{selectedSeats.join(', ')}</span>
          </div>
          <div className="flex justify-between text-sm pt-4 border-t-2 border-dashed font-black">
            <span className="text-zinc-800">Total Amount Paid</span>
            <span className="text-rose-500 text-lg">₹{selectedSeats.length * SEAT_PRICE}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={resetApp}
        className="flex items-center gap-2 text-rose-500 font-bold px-10 py-4 rounded-xl border-2 border-rose-500 hover:bg-rose-50 transition-all active:scale-95"
      >
        <Ticket size={20} />
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 overflow-x-hidden selection:bg-rose-100 selection:text-rose-600">
      <Header />
      
      {currentPage === 'home' && (
        <div className="bg-zinc-50 border-b px-4 md:px-8 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="max-w-7xl mx-auto flex gap-6 text-sm font-bold text-zinc-500 uppercase tracking-tighter">
            <span className="text-rose-500 cursor-pointer pb-0.5 border-b-2 border-rose-500">Movies</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Stream</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Events</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Plays</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Sports</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Activities</span>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="pb-24 min-h-[60vh]">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'details' && <MovieDetailsPage />}
        {currentPage === 'theatre' && <TheatrePage />}
        {currentPage === 'seats' && <SeatSelectionPage />}
        {currentPage === 'confirmation' && <ConfirmationPage />}
      </main>

      {/* Simple Footer */}
      <footer className="bg-zinc-900 text-zinc-500 py-16 px-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-white text-2xl font-black mb-2 tracking-tighter italic">
            book<span className="text-rose-500">my</span>show <span className="text-xs font-normal not-italic opacity-50 ml-2">Clone</span>
          </h2>
          <p className="text-xs mb-8 max-w-sm mx-auto opacity-70">The best way to book your favorite movies. Powered by TMDB API.</p>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Customer Care</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}