const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const nanoid = (size = 12): string => {
  let id = '';
  for (let i = 0; i < size; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    id += alphabet[index];
  }
  return id;
};
