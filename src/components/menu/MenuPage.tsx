import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { RestaurantHeader } from "@/components/menu/RestaurantHeader";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { ProductCard } from "@/components/menu/ProductCard";
import { useRestaurant, useInitializeRestaurant } from "@/hooks/useRestaurant";
import { Product } from "@/types/restaurant";

const CAMPAIGN_CATEGORY_ID = "__campaign__";
const SCROLL_SPEED = 1; // pixels per frame
const CATEGORY_PAUSE_MS = 3000; // pause between categories

export function MenuPage() {
  const { t } = useTranslation();
  const { isLoading, error } = useInitializeRestaurant();
  const { categories, campaignProducts, restaurant, formatPrice } = useRestaurant();

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  // Build the list of "sections" to cycle through: campaign first (if any), then categories
  const sections = useMemo(() => {
    const result: { id: string; name: string; products: Product[]; isCampaign?: boolean }[] = [];

    if (campaignProducts.length > 0) {
      result.push({
        id: CAMPAIGN_CATEGORY_ID,
        name: `🔥 ${t("menu.campaignProducts")}`,
        products: campaignProducts,
        isCampaign: true,
      });
    }

    categories.forEach((cat) => {
      result.push({
        id: cat.id,
        name: cat.name,
        products: cat.products,
      });
    });

    return result;
  }, [categories, campaignProducts, t]);

  const currentSection = sections[activeCategoryIndex] || sections[0];

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollContainerRef.current || sections.length === 0) return;

    const container = scrollContainerRef.current;
    let paused = false;

    const scrollStep = () => {
      if (paused) return;

      const maxScroll = container.scrollHeight - container.clientHeight;

      if (maxScroll <= 0 || container.scrollTop >= maxScroll - 2) {
        // Reached bottom — pause, then move to next category
        paused = true;
        setTimeout(() => {
          setActiveCategoryIndex((prev) => (prev + 1) % sections.length);
          paused = false;
        }, CATEGORY_PAUSE_MS);
        return;
      }

      container.scrollTop += SCROLL_SPEED;
      animationRef.current = requestAnimationFrame(scrollStep);
    };

    // Reset scroll to top when category changes
    container.scrollTop = 0;
    // Small delay before starting scroll to let layout settle
    const startDelay = setTimeout(() => {
      animationRef.current = requestAnimationFrame(scrollStep);
    }, CATEGORY_PAUSE_MS);

    return () => {
      clearTimeout(startDelay);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeCategoryIndex, sections]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">{t("common.loading", "Loading...")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
            {t("common.retry", "Retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Restaurant Header - simplified for TV */}
      <RestaurantHeader />

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={currentSection?.id || ""}
        onCategoryChange={() => {}}
        campaignTab={
          campaignProducts.length > 0
            ? { id: CAMPAIGN_CATEGORY_ID, name: t("menu.campaignProducts"), count: campaignProducts.length }
            : null
        }
      />

      {/* Current Category Title */}
      <div className="px-6 py-4 bg-primary/5 border-b border-border">
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center">
          {currentSection?.name}
          <span className="text-base font-normal text-muted-foreground ml-3">
            ({currentSection?.products.length})
          </span>
        </h2>
      </div>

      {/* Scrolling Products Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-hidden">
        <div className="container px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="wait">
              {currentSection?.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSpecialPriceActive={restaurant.isSpecialPriceActive}
                  specialPriceName={restaurant.specialPriceName}
                  formatPrice={formatPrice}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
