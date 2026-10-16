import WishlistItems from "@/components/unit/WishlistItems";

export default function UserWishlistPage() {
  return <section className="space-y-4"><header><h2 className="text-lg font-bold text-white">Saved wishlist</h2><p className="mt-1 text-sm text-zinc-500">Products saved for later.</p></header><WishlistItems /></section>;
}