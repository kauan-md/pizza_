export type Category =
  | "ofertas"
  | "bebidas"
  | "tradicionais"
  | "doces";

export interface CategoryDef {
  id: Category;
  label: string;
}

export const categories: CategoryDef[] = [
  { id: "ofertas", label: "Ofertas Exclusivas" },
  { id: "tradicionais", label: "Tradicionais" },
  { id: "bebidas", label: "Bebidas" },
  { id: "doces", label: "Sobremesas" },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: Category;
  tag?: string;
  image: string;
}

// High quality pizza/food placeholders from Unsplash (fixed sizes for fast loads)
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

export const products: Product[] = [
  {
    id: "p1",
    name: "Pizza Francesa + Sukita",
    description:
      "Molho especial Lopez, presunto, milho, ervilha, ovo e catupiry. Acompanha Sukita 350ml.",
    price: 39.99,
    oldPrice: 54.9,
    category: "ofertas",
    tag: "Combo",
    image: img("photo-1513104890138-7c749659a591"),
  },
  {
    id: "p2",
    name: "Promo Calabresa de Seg. a Qui.",
    description:
      "Calabresa fatiada, cebola roxa, muçarela premium e azeitonas. No precinho da semana.",
    price: 22.99,
    oldPrice: 44.9,
    category: "ofertas",
    tag: "Precinho",
    image: img("photo-1565299624946-b28f40a0ae38"),
  },
  {
    id: "p3",
    name: "Dupla Lopez (2 Médias)",
    description:
      "Duas pizzas médias para você escolher os sabores. Ideal para dividir com a galera.",
    price: 64.9,
    oldPrice: 89.9,
    category: "ofertas",
    tag: "2 por 1",
    image: img("photo-1593560708920-61dd98c46a4e"),
  },
  {
    id: "p4",
    name: "Pizza Margherita",
    description:
      "Molho de tomate italiano, muçarela de búfala, manjericão fresco e azeite extra virgem.",
    price: 44.9,
    category: "tradicionais",
    image: img("photo-1574071318508-1cdbab80d002"),
  },
  {
    id: "p5",
    name: "Pizza Calabresa",
    description:
      "Calabresa artesanal, cebola, muçarela e orégano sobre massa de longa fermentação.",
    price: 42.9,
    category: "tradicionais",
    image: img("photo-1571997478779-2adcbbe9ab2f"),
  },
  {
    id: "p6",
    name: "Pizza Quatro Queijos",
    description: "Muçarela, provolone, parmesão e gorgonzola com toque de mel.",
    price: 49.9,
    category: "tradicionais",
    image: img("photo-1601924582970-9238bcb495d9"),
  },
  {
    id: "p7",
    name: "Pizza Portuguesa",
    description: "Presunto, ovo, cebola, ervilha, azeitona e muçarela.",
    price: 47.9,
    category: "tradicionais",
    image: img("photo-1604382354936-07c5d9983bd3"),
  },
  {
    id: "b1",
    name: "Coca-Cola 2L",
    description: "Refrigerante gelado para acompanhar sua pizza.",
    price: 12.0,
    category: "bebidas",
    image: img("photo-1554866585-cd94860890b7"),
  },
  {
    id: "b2",
    name: "Guaraná Antarctica 2L",
    description: "O sabor brasileiro que combina com qualquer sabor.",
    price: 10.0,
    category: "bebidas",
    image: img("photo-1625772299848-391b6a87d7b3"),
  },
  {
    id: "b3",
    name: "Suco Natural de Laranja 500ml",
    description: "Laranja espremida na hora, sem açúcar adicionado.",
    price: 9.5,
    category: "bebidas",
    image: img("photo-1600271886742-f049cd451bba"),
  },
  {
    id: "d1",
    name: "Pizza Doce de Chocolate",
    description: "Chocolate ao leite, granulado e morangos frescos.",
    price: 39.9,
    category: "doces",
    tag: "Top",
    image: img("photo-1542843137-8791a6904d14"),
  },
  {
    id: "d2",
    name: "Pizza de Banana com Canela",
    description: "Banana caramelizada, leite condensado e canela.",
    price: 36.9,
    category: "doces",
    image: img("photo-1565958011703-44f9829ba187"),
  },
];

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
