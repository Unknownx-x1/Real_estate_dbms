export interface PropertyItem {
  id: string;
  code: string;           // e.g. "PR / 001"
  type: string;           // e.g. "CANTILEVER RESIDENCE"
  name: string;           // e.g. "THE MONOLITH PAVILION"
  location: string;       // e.g. "SINTRA, PORTUGAL"
  price: string;          // e.g. "€ 4,850,000"
  size: string;           // e.g. "6,400 SQ.FT"
  architect: string;      // e.g. "STUDIO VALERIO OLGIATI"
  year: string;           // e.g. "2024"
  materials: string;      // e.g. "POURED TERRACOTTA CONCRETE • VOLCANIC BASALT"
  bgWord: string;         // Giant background typography word: "ARCHITECTURE", "MONOLITH", "PAVILION", etc.
  bgTone: string;         // Background hex color (architectural tone)
  textTone: string;       // Primary typography hex
  subtleTone: string;     // Muted typography hex
  borderTone: string;     // Hairline border color
  heroImage: string;      // Curated architectural photography
}
