import { useState, useEffect } from "react";
import axios from "axios";

export default function useCover(title) {
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCover = async () => {
      try {
        const res = await axios.get(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`
        );
        const doc = res.data.docs?.[0];
        if (!cancelled && doc?.cover_i) {
          setCoverUrl(`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
        }
      } catch (err) {
        console.error("Greška pri dohvatu korica:", err);
      }
    };

    if (title) {
      fetchCover();
    }

    return () => {
      cancelled = true;
    };
  }, [title]);

  return coverUrl;
}
