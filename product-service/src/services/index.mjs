import { readFile } from 'fs/promises';
const data = JSON.parse(
  await readFile(
    new URL('../mock/data.json', import.meta.url)
  )
);

export const getAllProducts = () => {
    return data;
}
export const getProductById = (productId) => {
    return data.find((item) =>  item.id === productId);
}