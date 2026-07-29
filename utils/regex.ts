export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const timeRegex = /^\d{2}:[0-5]\d$/;
export const dailyFrequencyRegex = /^(\d+)x sehari$/i;
export const tensiRegex = /^\d{2,3}\/\d{2,3}$/; // Contoh valid: 120/80
export const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/; // Regex No Telp Indonesia (08.., 628.., +628..)
export const nameRegex = /^[a-zA-Z\s.'-,]+$/; // Regex Nama (huruf, spasi, titik, koma, tanda petik, strip)
