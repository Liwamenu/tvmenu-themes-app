import { memo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Product, Portion } from "@/types/restaurant";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isSpecialPriceActive: boolean;
  specialPriceName: string;
  formatPrice: (price: number) => string;
}

function getPriceDisplay(portion: Portion, isSpecialPriceActive: boolean) {
  const hasSpecial = isSpecialPriceActive && portion.specialPrice !== null;
  const hasCampaign = portion.campaignPrice !== null;

  let displayPrice = portion.price;
  let originalPrice: number | null = null;
  let priceType: "normal" | "campaign" | "special" = "normal";

  if (hasSpecial) {
    displayPrice = portion.specialPrice!;
    originalPrice = portion.price;
    priceType = "special";
  } else if (hasCampaign) {
    displayPrice = portion.campaignPrice!;
    originalPrice = portion.price;
    priceType = "campaign";
  }

  return { displayPrice, originalPrice, priceType };
}

export const ProductCard = memo(function ProductCard({
  product,
  isSpecialPriceActive,
  specialPriceName,
  formatPrice,
}: ProductCardProps) {
  const { t } = useTranslation();
  const firstPortion = product.portions[0];
  const { displayPrice, originalPrice, priceType } = getPriceDisplay(firstPortion, isSpecialPriceActive);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Recommendation Badge */}
      {product.recommendation && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium shadow-md">
          <Star className="w-3 h-3 fill-current" />
          <span>{t("productCard.recommended")}</span>
        </div>
      )}

      {/* Price Badge */}
      {priceType !== "normal" && (
        <div
          className={cn(
            "absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold shadow-md",
            priceType === "campaign" ? "bg-campaign text-campaign-foreground" : "bg-special text-special-foreground",
          )}
        >
          {priceType === "special" ? specialPriceName : t("productCard.campaign")}
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.imageURL}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{product.description}</p>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">{formatPrice(displayPrice)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
