import React from 'react';
import { Link } from 'react-router-dom';
import { productsData } from './data';
import { ProductItem } from './types';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface MarketplaceGridProps {
  onSelectProduct?: (product: ProductItem) => void;
  products?: ProductItem[];
}

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ onSelectProduct, products = productsData }) => {
  return (
    <section id="marketplace" className="py-20 md:py-28 bg-white border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* En-tête de section avec le bouton en haut à droite */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] text-slate font-mono uppercase tracking-wider block">Marketplace</span>
            <h2 className="text-3xl md:text-5xl font-serif text-ink tracking-tight font-normal leading-[1.1]">
              Aperçu des produits numériques <em className="text-blue italic">populaires</em>
            </h2>
          </div>

          <div className="md:max-w-sm space-y-4 flex flex-col md:items-end">
            <p className="text-sm text-slate font-sans leading-relaxed md:text-right">
              Des milliers de créateurs vendent déjà leurs cours, templates, logiciels et ebooks via Dukaio.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-600 text-white font-sans text-xs font-bold transition-all shadow-md hover:shadow-lg group shrink-0"
            >
              <span>Voir plus de produits</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl border border-slate-200 hover:border-blue/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div
                style={{ backgroundColor: product.couleur }}
                className="aspect-[16/10] p-6 flex flex-col justify-between relative overflow-hidden text-white"
              >
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.titre} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                )}
                
                <div className="flex justify-between items-start z-10 relative">
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-white font-medium">
                    {product.categorie}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </span>
                </div>

                <div className="z-10 text-center px-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute bottom-0 left-0 right-0 p-4 pt-12">
                  <h3 className="font-serif text-lg font-medium text-white line-clamp-2 leading-tight drop-shadow-md">
                    {product.titre}
                  </h3>
                </div>

                {/* Subtle pattern background effect for products without images */}
                {!product.image && <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate">
                      Vendu par <strong className="text-ink font-medium">{product.vendeur}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate line-clamp-2 font-sans leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-hair flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate uppercase tracking-wider block">Prix direct</span>
                    <span className="font-serif text-xl font-medium text-ink">
                      {product.prix}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                    className="w-full bg-blue text-white hover:bg-blue-600 py-2.5 rounded-lg text-sm font-sans font-semibold text-center transition-colors shadow-sm"
                  >
                    Acheter maintenant
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
