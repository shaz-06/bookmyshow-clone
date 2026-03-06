import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Loader2,
  Lock,
  Calendar,
  Play,
  MapPin as MapPinIcon,
  Trophy,
  Users,
  Palette,
  Theater
} from 'lucide-react';

// --- API Configuration ---
const MOVIEGLU_API_URL = "https://api-gate2.movieglu.com/filmsNowShowing/?n=2";
const TMDB_API_KEY = "ba5e2748d7df42cab33e99e177a6c088";
const TMDB_FALLBACK_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

// --- Mock Data ---
const THEATRES = [
  { id: 't1', name: "PVR: Orion Mall, Bengaluru", times: ["10:30 AM", "01:45 PM", "05:00 PM", "09:30 PM"] },
  { id: 't2', name: "INOX: Garuda Mall, Magrath Road", times: ["11:00 AM", "03:15 PM", "07:00 PM", "10:45 PM"] },
  { id: 't3', name: "Cinepolis: Forum Mall, Koramangala", times: ["09:00 AM", "12:30 PM", "04:00 PM", "08:15 PM"] }
];

const SEAT_PRICE = 250;
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const LIVE_EVENTS = [
  { id: 1, title: "Comedy Shows", subtitle: "190+ Events", gradient: "from-blue-600/80 to-indigo-900/80", image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260" },
  { id: 2, title: "Amusement Park", subtitle: "10+ Events", gradient: "from-amber-400/80 to-orange-700/80", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
  { id: 3, title: "Theatre Shows", subtitle: "65+ Events", gradient: "from-emerald-500/80 to-teal-900/80", image: "https://images.unsplash.com/photo-1503095396549-807759245b35" },
  { id: 4, title: "ICC Men's T20WC 2026", subtitle: "Sports Event", gradient: "from-rose-600/80 to-pink-900/80", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e" },
  { id: 5, title: "Holi Parties", subtitle: "15+ Events", gradient: "from-fuchsia-500/80 to-purple-900/80", image: "https://images.unsplash.com/photo-1611080626919-7cf5a9f13a07" },
];

const PREMIERES_DATA = [
  { id: 1, title: "The Beekeeper", lang: "English", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
  { id: 2, title: "Anyone But You", lang: "English", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c" },
  { id: 3, title: "Ferrari", lang: "English", poster: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2" },
  { id: 4, title: "Poor Things", lang: "English", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728" },
  { id: 5, title: "Land of Bad", lang: "English", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8" }
];

const STREAM_CONTENT = {
  trending: [
    { id: 1, title: "Top Gun: Maverick", rent: "₹99", buy: "₹499", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8" },
    { id: 2, title: "Interstellar", rent: "₹120", buy: "₹699", poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa" },
    { id: 3, title: "The Dark Knight", rent: "₹99", buy: "₹399", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26" },
    { id: 4, title: "Dune", rent: "₹149", buy: "₹599", poster: "https://images.unsplash.com/photo-1509333303761-1b18afea1bc3" },
    { id: 5, title: "Oppenheimer", rent: "₹199", buy: "₹799", poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820" }
  ],
  newlyAdded: [
    { id: 6, title: "Gran Turismo", rent: "₹149", buy: "₹599", poster: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c" },
    { id: 7, title: "Barbie", rent: "₹199", buy: "₹699", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728" },
    { id: 8, title: "Blue Beetle", rent: "₹149", buy: "₹599", poster: "https://images.unsplash.com/photo-1614728263952-84ea256f9679" },
    { id: 9, title: "Past Lives", rent: "₹120", buy: "₹499", poster: "https://images.unsplash.com/photo-1497124401559-3e75ec2ed774" },
    { id: 10, title: "Talk to Me", rent: "₹99", buy: "₹399", poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0" }
  ],
  popular: [
    { id: 11, title: "Everything Everywhere All at Once", rent: "₹149", buy: "₹599", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
    { id: 12, title: "Spider-Man: Across the Spider-Verse", rent: "₹149", buy: "₹699", poster: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe" },
    { id: 13, title: "The Whale", rent: "₹120", buy: "₹499", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26" },
    { id: 14, title: "Avatar: The Way of Water", rent: "₹199", buy: "₹799", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23" },
    { id: 15, title: "John Wick: Chapter 4", rent: "₹149", buy: "₹599", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8" }
  ]
};

const EVENTS_CONTENT = {
  comedy: [
    { id: 1, title: "Bass Karo Bassi", category: "Comedy", location: "Bengaluru", date: "Sun, 15 Mar", image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260" },
    { id: 2, title: "Rahul Subramanian Live", category: "Comedy", location: "Bengaluru", date: "Fri, 27 Mar", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81" }
  ],
  music: [], festivals: [], parties: []
};
const PLAYS_CONTENT = { drama: [], musical: [], standup: [], classical: [] };
const SPORTS_CONTENT = { cricket: [], football: [], badminton: [], marathon: [] };
const ACTIVITIES_CONTENT = { adventure: [], workshops: [], kids: [], food: [] };

// --- Sub-Components (Moved outside to fix continuous typing) ---

const Header = ({ 
  resetApp, 
  searchContainerRef, 
  showSearchResults, 
  searchQuery, 
  setSearchQuery, 
  setShowSearchResults, 
  searchResults, 
  handleSearchResultClick,
  isLoggedIn,
  handleLogout,
  setShowAuthModal,
  userEmail
}) => (
  <nav className="bg-white border-b sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-6 flex-1">
      <h1 className="text-2xl font-black text-rose-500 cursor-pointer whitespace-nowrap tracking-tighter" onClick={resetApp}>book<span className="text-zinc-800">my</span>show</h1>
      <div className="hidden md:block relative flex-1 max-w-md" ref={searchContainerRef}>
        <div className={`flex items-center border-2 rounded-xl px-3 py-1.5 transition-all duration-200 ${showSearchResults ? 'border-rose-400 bg-white ring-4 ring-rose-50 shadow-md' : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-100'}`}>
          <Search size={18} className={`${showSearchResults ? 'text-rose-500' : 'text-zinc-400'} mr-2 transition-colors`} />
          <input 
            type="text" 
            placeholder="Search for Movies, Events, Plays and more" 
            className="bg-transparent outline-none text-sm w-full font-medium placeholder:text-zinc-400"
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="ml-2 text-zinc-400 hover:text-rose-500 transition-colors bg-zinc-200/50 hover:bg-rose-100 p-0.5 rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            <div className="p-3 border-b bg-zinc-50/50">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Searching Results for "{searchQuery}"</p>
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((result, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0 transition-colors group"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 shadow-sm border border-zinc-100">
                    <img src={result.poster} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-zinc-800 truncate group-hover:text-rose-500 transition-colors">{result.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">{result.type}</span>
                      {result.rating && <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1"><Star size={10} fill="currentColor" /> {result.rating}</span>}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-zinc-300 group-hover:text-rose-300 transition-colors" />
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={24} className="text-zinc-200" />
                </div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No matching results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 ml-4">
      <div className="flex items-center text-zinc-600 cursor-pointer hover:text-rose-500 transition-colors"><span className="text-sm font-bold mr-1">Bengaluru</span><MapPin size={16} /></div>
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-xs uppercase">{userEmail ? userEmail[0] : 'U'}</div>
          <button onClick={handleLogout} className="text-xs font-bold text-zinc-400 hover:text-rose-500 uppercase">Logout</button>
        </div>
      ) : (
        <button onClick={() => setShowAuthModal(true)} className="bg-rose-500 text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/10">Sign In</button>
      )}
    </div>
  </nav>
);

const AuthModal = ({ showAuthModal, setShowAuthModal, handleSignIn, userEmail, setUserEmail }) => {
  if (!showAuthModal) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
      <div className="bg-white rounded-3xl w-full max-w-sm p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"><X size={20} /></button>
        <div className="text-center mb-8"><div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-rose-500" size={32} /></div><h2 className="text-2xl font-black text-zinc-800 tracking-tight">Login Required</h2></div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input required autoFocus type="email" placeholder="Enter Email Address" className="w-full border-2 border-zinc-100 rounded-2xl px-5 py-4 outline-none focus:border-rose-500 transition-colors text-sm font-medium" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-rose-500/20 transition-all active:scale-95">Continue</button>
        </form>
      </div>
    </div>
  );
};

const HomePage = ({ showAllMovies, movies, isLoading, error, setShowAllMovies, goToMovie }) => {
  const visibleMovies = showAllMovies ? movies : movies.slice(0, 4);
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-zinc-800 tracking-tight">Recommended Movies</h2>
        <button onClick={() => setShowAllMovies(!showAllMovies)} className="text-rose-500 text-sm font-bold flex items-center gap-1 hover:underline transition-all">
          {showAllMovies ? 'Show Less' : 'See All'} <ChevronRight size={16} className={`transition-transform duration-300 ${showAllMovies ? 'rotate-90' : ''}`} />
        </button>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 text-zinc-400"><Loader2 className="animate-spin mb-4" size={48} /><p className="font-bold uppercase tracking-widest text-xs">Fetching Blockbusters...</p></div>
      ) : error ? (
        <div className="text-center py-20 bg-rose-50 rounded-2xl border border-rose-100"><p className="text-rose-500 font-black mb-2">Notice</p><p className="text-zinc-500 text-sm mb-6">{error}</p><button onClick={() => window.location.reload()} className="bg-rose-500 text-white px-8 py-2 rounded-full font-bold shadow-lg shadow-rose-200">Try Again</button></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {visibleMovies.map(movie => (
            <div key={movie.id} className="group cursor-pointer" onClick={() => goToMovie(movie)}>
              <div className="aspect-[2/3] bg-zinc-100 rounded-2xl overflow-hidden mb-4 relative shadow-md border border-zinc-200 transition-all group-hover:shadow-xl group-hover:-translate-y-2">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent text-white p-3 pt-8 flex items-center justify-between">
                   <div className="flex items-center text-xs gap-1.5"><Star size={14} fill="currentColor" className="text-rose-500 border-none" /><span className="font-black">{movie.rating}</span></div>
                   <span className="text-[10px] text-zinc-300 font-black uppercase tracking-tighter">{movie.votes} Votes</span>
                </div>
              </div>
              <h3 className="font-bold text-zinc-800 truncate mb-1 text-lg leading-tight group-hover:text-rose-500 transition-colors">{movie.title}</h3>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">{movie.genre}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-zinc-800 tracking-tight">The Best Of Live Events</h2><button className="text-rose-500 text-sm font-bold flex items-center gap-1 hover:underline">See All <ChevronRight size={16} /></button></div>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
          {LIVE_EVENTS.map(event => (
            <div key={event.id} className={`relative flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group`}>
              <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} opacity-60 group-hover:opacity-75 transition-opacity duration-300`}></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end"><h3 className="text-white font-black text-xl leading-tight mb-1 relative z-10 drop-shadow-md">{event.title}</h3><p className="text-white font-bold text-[10px] uppercase tracking-widest relative z-10 opacity-90">{event.subtitle}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16 bg-[#2B3148] -mx-4 md:-mx-8 p-4 md:p-8">
        <div className="max-w-7xl mx-auto"><div className="flex justify-between items-center mb-2"><h2 className="text-2xl font-black text-white tracking-tight">Premieres</h2><button className="text-rose-500 text-sm font-bold flex items-center gap-1 hover:underline">See All <ChevronRight size={16} /></button></div><p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-8">Brand new releases every Friday</p><div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">{PREMIERES_DATA.map(movie => (<div key={movie.id} className="flex-shrink-0 w-48 group cursor-pointer"><div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-2xl relative"><img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /><div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Premiere</div></div><h3 className="text-white font-bold truncate text-sm">{movie.title}</h3><p className="text-zinc-500 text-xs font-bold mt-1 uppercase tracking-tighter">{movie.lang}</p></div>))}</div></div>
      </div>
    </div>
  );
};

const StreamPage = () => {
  const StreamSection = ({ title, movies }) => (
    <div className="mt-12"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-zinc-800 tracking-tight">{title}</h2><button className="text-rose-500 text-xs font-bold flex items-center gap-1 hover:underline">See All <ChevronRight size={14} /></button></div><div className="flex gap-6 overflow-x-auto scrollbar-hide pb-6">{movies.map(movie => (<div key={movie.id} className="flex-shrink-0 w-44 group cursor-pointer"><div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-md border border-zinc-100 relative group-hover:shadow-xl transition-all group-hover:-translate-y-1"><img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"><div className="opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all bg-rose-500 text-white p-3 rounded-full"><Play fill="currentColor" size={24} /></div></div></div><h3 className="font-bold text-zinc-800 text-sm truncate">{movie.title}</h3><div className="flex gap-2 mt-1"><span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Rent {movie.rent}</span><span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter border-l pl-2">Buy {movie.buy}</span></div></div>))}</div></div>
  );
  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8"><div className="relative h-64 md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer"><img src="https://images.unsplash.com/photo-1574267432553-4b2181c3a16b" alt="Stream Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" /><div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-16"><div className="max-w-md text-white"><span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">New Release</span><h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 tracking-tight">The Best of World Cinema, Home-Delivered.</h1><button className="bg-white text-zinc-900 font-black px-10 py-3 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs">Explore Stream</button></div></div></div><StreamSection title="Trending to Rent" movies={STREAM_CONTENT.trending} /><StreamSection title="Newly Added" movies={STREAM_CONTENT.newlyAdded} /><StreamSection title="Popular Stream Movies" movies={STREAM_CONTENT.popular} /></div>
  );
};

const GenericContentPage = ({ title, sections, data, icon: Icon }) => (
  <div className="animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8"><div className="mb-12 flex items-center gap-4"><div className="p-3 bg-rose-50 rounded-2xl text-rose-500"><Icon size={28} /></div><div><h1 className="text-3xl font-black text-zinc-800 tracking-tight">{title} in Bengaluru</h1><p className="text-zinc-500 text-sm font-medium">Browse through the best near you</p></div></div>
    {Object.keys(sections).map(key => (
      <div key={key} className="mt-12"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-zinc-800 tracking-tight uppercase tracking-widest">{sections[key]}</h2><button className="text-rose-500 text-xs font-bold flex items-center gap-1 hover:underline">See All <ChevronRight size={14} /></button></div>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-6">
          {data[key] && data[key].length > 0 ? data[key].map(item => (
            <div key={item.id} className="flex-shrink-0 w-64 group cursor-pointer"><div className="aspect-[4/5] rounded-2xl overflow-hidden mb-3 shadow-md border border-zinc-100 relative group-hover:shadow-xl transition-all group-hover:-translate-y-1"><img src={item.image} alt={item.title} className="w-full h-full object-cover" /></div><h3 className="font-bold text-zinc-800 text-sm truncate">{item.title}</h3><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{item.category}</p><div className="flex items-center gap-1 text-zinc-400 mt-1"><MapPinIcon size={10} /><span className="text-[10px] font-medium">{item.location}</span></div><p className="text-[10px] font-black text-zinc-400 mt-0.5 uppercase tracking-tighter">{item.date}</p></div>
          )) : <p className="text-zinc-400 italic text-sm py-10">No events found in this category.</p>}
        </div>
      </div>
    ))}
  </div>
);

const MovieDetailsPage = ({ selectedMovie, goToTheatre }) => (
  <div className="animate-in fade-in duration-300">
    <div className="relative min-h-[400px] md:h-[520px] w-full bg-zinc-950 flex items-center overflow-hidden">
      <div className="absolute inset-0 opacity-40"><img src={selectedMovie.banner} alt="backdrop" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent"></div></div>
      <div className="flex flex-col md:flex-row gap-12 items-center md:items-start z-10 w-full max-w-6xl mx-auto px-6 py-10 md:py-0">
        <div className="w-56 md:w-80 flex-shrink-0 aspect-[2/3] bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10"><img src={selectedMovie.poster} alt={selectedMovie.title} className="w-full h-full object-cover" /></div>
        <div className="text-white flex-1 text-center md:text-left mt-4 md:mt-12"><h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">{selectedMovie.title}</h1><div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8 text-sm"><div className="flex items-center bg-zinc-800/90 px-4 py-2 rounded-xl border border-zinc-700"><Star size={18} fill="currentColor" className="text-rose-500 mr-2" /><span className="font-black text-lg">{selectedMovie.rating}</span></div><div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-widest text-xs"><Calendar size={14} /> {selectedMovie.releaseDate}</div><div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-widest text-xs"><Clock size={14} /> {selectedMovie.duration}</div></div><div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10">{selectedMovie.genre.split(',').map(g => (<span key={g} className="px-4 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">{g.trim()}</span>))}</div><button onClick={goToTheatre} className="bg-rose-500 hover:bg-rose-600 text-white font-black py-4 px-16 rounded-2xl transition-all shadow-xl shadow-rose-500/20 active:scale-95 w-full md:w-auto uppercase tracking-widest text-sm">Book tickets</button></div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto p-8 md:p-12"><h3 className="text-2xl font-black mb-6 text-zinc-800">About the movie</h3><p className="text-zinc-500 leading-relaxed max-w-4xl text-lg font-medium">{selectedMovie.description}</p></div>
  </div>
);

const TheatrePage = ({ selectedMovie, setCurrentPage, goToSeats }) => (
  <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-6 text-zinc-800"><div className="flex items-center gap-6 mb-10"><button onClick={() => setCurrentPage('details')} className="bg-zinc-100 hover:bg-zinc-200 p-3 rounded-2xl transition-colors"><ChevronLeft /></button><div><h2 className="text-3xl font-black leading-none mb-1">{selectedMovie.title}</h2><p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{selectedMovie.genre} | {selectedMovie.releaseDate}</p></div></div><div className="space-y-6">{THEATRES.map(theatre => (<div key={theatre.id} className="bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm hover:border-zinc-200 transition-all"><div className="p-6 border-b-2 border-zinc-50 bg-zinc-50/50 flex items-center justify-between"><h3 className="font-black flex items-center gap-3">{theatre.name}</h3><span className="text-[10px] text-green-600 font-black bg-green-100 px-3 py-1 rounded-full uppercase tracking-tighter">M-Ticket</span></div><div className="p-6 flex flex-wrap gap-4">{theatre.times.map(time => (<button key={time} onClick={() => goToSeats(theatre.name, time)} className="border-2 border-zinc-100 rounded-xl px-8 py-3 text-sm font-black text-green-600 hover:border-green-600 hover:bg-green-50 transition-all active:scale-95">{time}</button>))}</div></div>))}</div></div>
);

const SeatSelectionPage = ({ selectedMovie, selectedTheatre, selectedTime, setCurrentPage, occupiedSeats, selectedSeats, handleSeatToggle, handleMouseEnter, totalPrice, isProcessing, isLoggedIn, setShowAuthModal, confirmBooking, setIsMouseDown }) => (
  <div className="max-w-4xl mx-auto p-4 md:p-12 animate-in zoom-in-95 duration-300" onMouseLeave={() => setIsMouseDown(false)}><div className="flex justify-between items-start mb-12"><div><h2 className="text-2xl font-black text-zinc-800 leading-none mb-1">{selectedMovie.title}</h2><p className="text-zinc-400 text-xs font-black uppercase tracking-widest">{selectedTheatre?.split(':')[0]} | {selectedTime}</p></div><button onClick={() => setCurrentPage('theatre')} className="p-3 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-colors"><X size={20} /></button></div><div className="flex flex-col items-center mb-24"><div className="w-full max-lg h-2 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 rounded-full shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] mb-4"></div><p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black">All eyes this way please!</p></div><div className="flex flex-col items-center gap-5 mb-16 select-none overflow-x-auto pb-6">{ROWS.map(row => (<div key={row} className="flex gap-4 items-center"><span className="w-6 text-sm font-black text-zinc-300">{row}</span>{COLS.map(col => { const seatId = `${row}${col}`; const isOccupied = occupiedSeats.includes(seatId); const isSelected = selectedSeats.includes(seatId); return (<button key={col} disabled={isOccupied} onMouseDown={(e) => { e.preventDefault(); setIsMouseDown(true); handleSeatToggle(seatId); }} onMouseEnter={() => handleMouseEnter(seatId)} className={`w-9 h-9 rounded-lg text-[11px] font-black transition-all duration-200 ${isOccupied ? 'bg-zinc-100 text-zinc-100 cursor-not-allowed opacity-40' : isSelected ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30 scale-110' : 'border-2 border-zinc-200 text-zinc-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50'}`} >{col}</button>); })}</div>))}</div>{selectedSeats.length > 0 && (<div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-full duration-500"><div className="max-w-4xl mx-auto flex items-center justify-between"><div><p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">Seats: <span className="text-zinc-900">{selectedSeats.join(', ')}</span></p><p className="text-3xl font-black text-zinc-800 leading-none">₹{totalPrice}</p></div><button disabled={isProcessing} onClick={() => { if (!isLoggedIn) setShowAuthModal(true); else confirmBooking(); }} className={`bg-rose-500 text-white font-black px-14 py-4 rounded-2xl transition-all shadow-xl shadow-rose-500/30 active:scale-95 uppercase tracking-widest text-sm flex items-center gap-2 ${isProcessing ? 'opacity-70 cursor-wait' : 'hover:bg-rose-600'}`}>{isProcessing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Proceed to Pay"}</button></div></div>)}</div>
);

const ConfirmationPage = ({ selectedMovie, selectedTime, selectedSeats, resetApp }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-in zoom-in-95 duration-700"><div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-inner"><CheckCircle2 size={56} className="text-green-500" /></div><h2 className="text-4xl font-black text-zinc-800 mb-3 tracking-tight">Booking Confirmed!</h2><p className="text-zinc-500 mb-10 font-bold uppercase tracking-widest text-xs">Continuous entertainment starts now.</p><div className="bg-zinc-50 border-2 border-zinc-100 rounded-[2.5rem] p-8 w-full max-w-md text-left mb-10 shadow-sm relative overflow-hidden"><div className="flex gap-6 mb-6 pb-6 border-b-2 border-zinc-100"><div className="w-24 h-32 bg-zinc-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"><img src={selectedMovie?.poster} alt="poster" className="w-full h-full object-cover" /></div><div className="flex flex-col justify-center"><h3 className="font-black text-2xl text-zinc-800 leading-none mb-2">{selectedMovie?.title}</h3><p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">{selectedMovie?.genre}</p></div></div><div className="space-y-4"><div className="flex justify-between text-sm"><span className="text-zinc-400 font-bold uppercase tracking-widest">Time</span><span className="font-black text-zinc-800">{selectedTime}</span></div><div className="flex justify-between text-sm"><span className="text-zinc-400 font-bold uppercase tracking-widest">Seats</span><span className="font-black text-rose-500">{selectedSeats.join(', ')}</span></div><div className="flex justify-between text-sm pt-6 border-t-2 border-zinc-100 font-black"><span className="text-zinc-800 uppercase tracking-widest text-xs">Total Paid</span><span className="text-zinc-800 text-2xl tracking-tighter">₹{selectedSeats.length * SEAT_PRICE}</span></div></div></div><button onClick={resetApp} className="flex items-center gap-3 text-rose-500 font-black px-12 py-4 rounded-2xl border-2 border-rose-500 hover:bg-rose-50 transition-all active:scale-95 uppercase tracking-widest text-sm"><Ticket size={20} /> Back to Home</button></div>
);

// --- App Component ---

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

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showAllMovies, setShowAllMovies] = useState(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(""); 
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Search Logic (Debounced) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = debouncedQuery.toLowerCase();
    const allMovies = movies.map(m => ({ ...m, type: 'Movie' }));
    const allLiveEvents = LIVE_EVENTS.map(e => ({ ...e, type: 'Live Event', poster: e.image }));
    const allPremieres = PREMIERES_DATA.map(p => ({ ...p, type: 'Premiere' }));
    const streamItems = Object.values(STREAM_CONTENT).flat().map(s => ({ ...s, type: 'Stream' }));
    const eventItems = Object.values(EVENTS_CONTENT).flat().map(e => ({ ...e, type: 'Event', poster: e.image }));
    const playItems = Object.values(PLAYS_CONTENT).flat().map(p => ({ ...p, type: 'Play', poster: p.image }));
    const sportItems = Object.values(SPORTS_CONTENT).flat().map(s => ({ ...s, type: 'Sport', poster: s.image }));
    const activityItems = Object.values(ACTIVITIES_CONTENT).flat().map(a => ({ ...a, type: 'Activity', poster: a.image }));

    const combined = [...allMovies, ...allLiveEvents, ...allPremieres, ...streamItems, ...eventItems, ...playItems, ...sportItems, ...activityItems];
    const filtered = combined.filter(item => item.title.toLowerCase().includes(q));
    const uniqueResults = Array.from(new Map(filtered.map(item => [item.title, item])).values());
    setSearchResults(uniqueResults.slice(0, 8));
  }, [debouncedQuery, movies]);

  // --- Movie Fetching Logic with Fallback ---
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(MOVIEGLU_API_URL);
          if (!response.ok) throw new Error("MovieGlu failed");
          const data = await response.json();
          if (data && data.films && data.films.length > 0) {
            const formattedMovies = data.films.map((film, index) => ({
              id: film.film_id || index,
              title: film.film_name,
              rating: "8.9/10",
              votes: "24K",
              duration: "2h 15m",
              genre: film.genres?.[0]?.genre_name || "Drama",
              description: film.synopsis_long || "No description available.",
              poster: film.images?.poster?.["1"]?.medium?.film_image || "https://via.placeholder.com/500x750",
              banner: film.images?.poster?.["1"]?.medium?.film_image || "https://via.placeholder.com/1200x400",
              releaseDate: film.release_dates?.[0]?.release_date || "Coming Soon"
            }));
            setMovies(formattedMovies);
            return;
          }
        } catch (e) {}

        const tmdbResponse = await fetch(TMDB_FALLBACK_URL);
        if (!tmdbResponse.ok) throw new Error("All data sources failed");
        const tmdbData = await tmdbResponse.json();
        if (tmdbData && tmdbData.results) {
          const formattedMovies = tmdbData.results.map(m => ({
            id: m.id,
            title: m.title,
            rating: `${m.vote_average.toFixed(1)}/10`,
            votes: m.vote_count > 1000 ? `${(m.vote_count / 1000).toFixed(1)}K` : m.vote_count,
            duration: "2h 12m",
            genre: m.genre_ids ? m.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 2).join(", ") : "Drama",
            description: m.overview || "No description available.",
            poster: m.poster_path ? `${IMAGE_BASE_URL}${m.poster_path}` : "https://via.placeholder.com/500x750",
            banner: m.backdrop_path ? `${BACKDROP_BASE_URL}${m.backdrop_path}` : `${IMAGE_BASE_URL}${m.poster_path}`,
            releaseDate: m.release_date || "Coming Soon"
          }));
          setMovies(formattedMovies);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (currentPage === 'home') fetchMovies();
  }, [currentPage]);

  useEffect(() => {
    if (selectedTime) {
      const occupied = [];
      ROWS.forEach(row => {
        COLS.forEach(col => { if (Math.random() < 0.25) occupied.push(`${row}${col}`); });
      });
      setOccupiedSeats(occupied);
      setSelectedSeats([]);
    }
  }, [selectedTime, selectedMovie]);

  const goToMovie = (movie) => { setSelectedMovie(movie); setCurrentPage('details'); setSearchQuery(""); setShowSearchResults(false); window.scrollTo(0, 0); };
  const handleSearchResultClick = (item) => {
    if (['Movie', 'Premiere', 'Stream'].includes(item.type)) goToMovie(item);
    else if (['Event', 'Live Event'].includes(item.type)) setCurrentPage('events');
    else if (item.type === 'Play') setCurrentPage('plays');
    else if (item.type === 'Sport') setCurrentPage('sports');
    else if (item.type === 'Activity') setCurrentPage('activities');
    setSearchQuery(""); setShowSearchResults(false); window.scrollTo(0, 0);
  };

  const goToTheatre = () => { setCurrentPage('theatre'); window.scrollTo(0, 0); };
  const goToSeats = (theatre, time) => { setSelectedTheatre(theatre); setSelectedTime(time); setCurrentPage('seats'); window.scrollTo(0, 0); };
  const confirmBooking = async () => { setIsProcessing(true); await new Promise(resolve => setTimeout(resolve, 1200)); setIsProcessing(false); setCurrentPage('confirmation'); window.scrollTo(0, 0); };
  const resetApp = () => { setCurrentPage('home'); setSelectedMovie(null); setSelectedTheatre(null); setSelectedTime(null); setSelectedSeats([]); };
  const handleSignIn = (e) => { e.preventDefault(); setIsLoggedIn(true); setShowAuthModal(false); };
  const handleLogout = () => { setIsLoggedIn(false); setUserEmail(""); };
  const handleSeatToggle = (seatId) => { if (occupiedSeats.includes(seatId)) return; setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]); };
  const handleMouseEnter = (seatId) => { if (isMouseDown && !selectedSeats.includes(seatId)) handleSeatToggle(seatId); };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 overflow-x-hidden selection:bg-rose-100 selection:text-rose-600 antialiased">
      <Header 
        resetApp={resetApp} 
        searchContainerRef={searchContainerRef} 
        showSearchResults={showSearchResults} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        setShowSearchResults={setShowSearchResults} 
        searchResults={searchResults} 
        handleSearchResultClick={handleSearchResultClick}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        setShowAuthModal={setShowAuthModal}
        userEmail={userEmail}
      />
      <AuthModal 
        showAuthModal={showAuthModal} 
        setShowAuthModal={setShowAuthModal} 
        handleSignIn={handleSignIn} 
        userEmail={userEmail} 
        setUserEmail={setSearchQuery} 
      />
      <div className="bg-zinc-50/50 border-b-2 border-zinc-50 px-4 md:px-8 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-[65px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex gap-10 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
          {['home', 'stream', 'events', 'plays', 'sports', 'activities'].map((page) => (
            <span key={page} className={`cursor-pointer pb-1 transition-all ${currentPage === page ? 'text-rose-500 border-b-2 border-rose-500' : 'hover:text-rose-500'}`} onClick={() => page === 'home' ? resetApp() : setCurrentPage(page)} >{page === 'home' ? 'Movies' : page.charAt(0).toUpperCase() + page.slice(1)}</span>
          ))}
        </div>
      </div>
      <main className="pb-32 min-h-[70vh]">
        {currentPage === 'home' && <HomePage showAllMovies={showAllMovies} movies={movies} isLoading={isLoading} error={error} setShowAllMovies={setShowAllMovies} goToMovie={goToMovie} />}
        {currentPage === 'stream' && <StreamPage />}
        {currentPage === 'events' && <GenericContentPage title="Events" data={EVENTS_CONTENT} icon={Users} sections={{ comedy: "Comedy Shows", music: "Music Concerts", festivals: "Festivals", parties: "Parties" }} />}
        {currentPage === 'plays' && <GenericContentPage title="Plays" data={PLAYS_CONTENT} icon={Theater} sections={{ drama: "Drama Plays", musical: "Musical Theatre", standup: "Stand-up Theatre", classical: "Classical Theatre" }} />}
        {currentPage === 'sports' && <GenericContentPage title="Sports" data={SPORTS_CONTENT} icon={Trophy} sections={{ cricket: "Cricket Matches", football: "Football Matches", badminton: "Badminton Tournaments", marathon: "Marathon Events" }} />}
        {currentPage === 'activities' && <GenericContentPage title="Activities" data={ACTIVITIES_CONTENT} icon={Palette} sections={{ adventure: "Adventure Trekking", workshops: "Workshops", kids: "Kids Activities", food: "Food Festivals" }} />}
        {currentPage === 'details' && <MovieDetailsPage selectedMovie={selectedMovie} goToTheatre={goToTheatre} />}
        {currentPage === 'theatre' && <TheatrePage selectedMovie={selectedMovie} setCurrentPage={setCurrentPage} goToSeats={goToSeats} />}
        {currentPage === 'seats' && <SeatSelectionPage selectedMovie={selectedMovie} selectedTheatre={selectedTheatre} selectedTime={selectedTime} setCurrentPage={setCurrentPage} occupiedSeats={occupiedSeats} selectedSeats={selectedSeats} handleSeatToggle={handleSeatToggle} handleMouseEnter={handleMouseEnter} totalPrice={selectedSeats.length * SEAT_PRICE} isProcessing={isProcessing} isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} confirmBooking={confirmBooking} setIsMouseDown={setIsMouseDown} />}
        {currentPage === 'confirmation' && <ConfirmationPage selectedMovie={selectedMovie} selectedTime={selectedTime} selectedSeats={selectedSeats} resetApp={resetApp} />}
      </main>
      <footer className="bg-zinc-950 text-zinc-600 py-24 px-4 mt-auto text-center opacity-60 font-black uppercase italic tracking-tighter">bookmyshow clone</footer>
    </div>
  );
}