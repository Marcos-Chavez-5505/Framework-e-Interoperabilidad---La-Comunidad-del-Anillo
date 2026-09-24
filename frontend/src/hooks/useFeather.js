import { useEffect } from 'react';

export default function useFeather() {
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);
}