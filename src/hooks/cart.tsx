import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const loadedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (loadedProducts) {
        setProducts(JSON.parse(loadedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      // const productIdx = products.findIndex(
      //   currentProduct => currentProduct.id === product.id,
      // );
      // let updatedProducts = [];
      // if (productIdx >= 0) {
      //   updatedProducts = products.map(currentProduct => {
      //     if (currentProduct.id === product.id) {
      //       return { ...product, quantity: currentProduct.quantity + 1 };
      //     }
      //     return currentProduct;
      //   });
      //   setProducts(updatedProducts);
      //   await AsyncStorage.setItem(
      //     '@GoMarketplace:products',
      //     JSON.stringify(updatedProducts),
      //   );
      //   return;
      // }
      // updatedProducts = products;
      // updatedProducts.push({ ...product, quantity: 1 });
      // setProducts(updatedProducts);
      // await AsyncStorage.setItem(
      //   '@GoMarketplace:products',
      //   JSON.stringify(updatedProducts),
      // );

      const productExists = products.find(p => p.id === product.id);
      if (productExists) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products.map(currentProduct => {
        if (currentProduct.id === id) {
          return { ...currentProduct, quantity: currentProduct.quantity + 1 };
        }
        return currentProduct;
      });
      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      let shouldRemove = false;
      let productIndex = 0;
      const updatedProducts = products.map((currentProduct, index) => {
        if (currentProduct.id === id) {
          if (currentProduct.quantity === 1) {
            shouldRemove = true;
            productIndex = index;
          }
          return { ...currentProduct, quantity: currentProduct.quantity - 1 };
        }
        return currentProduct;
      });
      if (shouldRemove) {
        updatedProducts.splice(productIndex, 1);
      }
      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
