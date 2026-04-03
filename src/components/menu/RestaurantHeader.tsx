import { motion } from "framer-motion";
import { useRestaurant } from "@/hooks/useRestaurant";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function RestaurantHeader() {
  const { restaurant } = useRestaurant();

  return (
    <header className="relative bg-card border-b border-border">
      <div className="container px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-card shadow-card overflow-hidden ring-2 ring-primary/20">
              <img src={restaurant.logoImageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">{restaurant.name}</h1>
              {restaurant.slogan1 && <p className="text-muted-foreground text-xs">{restaurant.slogan1}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
