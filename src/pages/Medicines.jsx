import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import { categories } from "../data/medicines";
import { getMedicines } from "../services/medicineApi";
import "./Medicines.css";

export default function Medicines({ onAddToCart }) {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState(500);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    getMedicines()
      .then(setMedicines)
      .catch((err) => console.error("Failed to load medicines:", err));
  }, []);

  const filtered = medicines
    .filter((m) => {
      const matchCat = activeCategory === "All" || m.category === activeCategory;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.brand.toLowerCase().includes(search.toLowerCase());
      const matchPrice = m.price <= priceRange;
      return matchCat && matchSearch && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="page-wrapper">
      <div className="medicines-hero">
        <div className="container">
          <h1>All Medicines</h1>
          <p>Browse our complete range of genuine, certified medicines</p>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search medicines, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="container medicines-layout">
        <aside className="filters-panel">
          <h3>Filters</h3>
          <div className="filter-group">
            <h4>Category</h4>
            {categories.map((cat) => (
              <button
                key={cat}
                className={"cat-filter-btn" + (activeCategory === cat ? " active" : "")}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} <span>{cat === "All" ? medicines.length : medicines.filter(m => m.category === cat).length}</span>
              </button>
            ))}
          </div>
          <div className="filter-group">
            <h4>Max Price: ₹{priceRange}</h4>
            <input type="range" min={20} max={500} value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="price-slider" />
            <div className="price-range-labels"><span>₹20</span><span>₹500</span></div>
          </div>
          <button className="btn btn-outline btn-sm btn-block" onClick={() => { setActiveCategory("All"); setSearch(""); setPriceRange(500); }}>
            Clear Filters
          </button>
        </aside>

        <div className="medicines-main">
          <div className="medicines-toolbar">
            <p className="results-count"><strong>{filtered.length}</strong> medicines found</p>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No medicines found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="medicines-grid">
              {filtered.map((m) => (
                <MedicineCard key={m.id} medicine={m} onAddToCart={onAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
