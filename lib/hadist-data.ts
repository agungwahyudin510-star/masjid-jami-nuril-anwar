export type Hadith = {
  number: number;
  arab: string;
  id: string;
  book: string;
  bookLabel: string;
  color: string;
  border: string;
  bg: string;
  tags: string[];
};

export const HADIST_DATA: Hadith[] = [
  {
    number: 1,
    arab: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    id: "Sesungguhnya setiap amalan tergantung pada niatnya.",
    book: "bukhari",
    bookLabel: "Shahih Bukhari",
    color: "#2ecc71",
    border: "rgba(46,204,113,.25)",
    bg: "rgba(46,204,113,.1)",
    tags: ["niat", "amal", "ibadah"],
  },
  {
    number: 227,
    arab: "الصَّلَاةُ عِمَادُ الدِّينِ",
    id: "Sholat adalah tiang agama.",
    book: "tirmidzi",
    bookLabel: "Sunan Tirmidzi",
    color: "#9b59b6",
    border: "rgba(155,89,182,.25)",
    bg: "rgba(155,89,182,.1)",
    tags: ["sholat", "agama", "ibadah"],
  },
];