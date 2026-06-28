import { shopifyFetch } from "./client";
import type { Cart } from "./types";

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
                altText
                width
                height
              }
              price {
                amount
                currencyCode
              }
              product {
                title
                handle
                vendor
              }
              selectedOptions {
                name
                value
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[]
) {
  const data = await shopifyFetch<{
    cartCreate: { cart: Cart };
  }>({
    query: `
      ${CART_FRAGMENT}
      mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { lines },
  });

  return data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
) {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: Cart };
  }>({
    query: `
      ${CART_FRAGMENT}
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { cartId, lines },
  });

  return data.cartLinesAdd.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
) {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: Cart };
  }>({
    query: `
      ${CART_FRAGMENT}
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { cartId, lines },
  });

  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: Cart };
  }>({
    query: `
      ${CART_FRAGMENT}
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFields
          }
        }
      }
    `,
    variables: { cartId, lineIds },
  });

  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string) {
  const data = await shopifyFetch<{
    cart: Cart | null;
  }>({
    query: `
      ${CART_FRAGMENT}
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
        }
      }
    `,
    variables: { cartId },
  });

  return data.cart;
}
