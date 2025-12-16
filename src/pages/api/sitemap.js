// src/pages/api/sitemap.js
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";

export default async function handler(req, res) {
  try {
    const baseUrl = 'https://tmarim-betomer.com';
    
    // Static pages
    const staticPages = [
      '',
      '/עלינו',
      '/צרו-קשר',
      '/offers',
      '/best-sellers',
      '/purchased-products',
      '/faqs',
      '/privacy-policy',
      '/תקנון-אתר',
      '/accessibility-statement',
    ];

    // Get categories
    let categoriesData = [];
    try {
      categoriesData = await CategoryServices.getShowingCategory() || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

    // Get products (limited to avoid timeout)
    let products = [];
    try {
      const productData = await ProductServices.getShowingProducts();
      products = productData || [];
    } catch (error) {
      console.error('Error fetching products:', error);
    }

    // Helper function to get category slug
    const getCategorySlug = (category) => {
      if (!category) return "";
      if (category.slug) {
        return category.slug;
      }
      // Fallback to Hebrew name if no slug
      return category.name?.he || category.name?.en || "";
    };

    // Generate category URLs
    const generateCategoryUrls = (categories) => {
      let urls = [];
      
      categories.forEach(category => {
        // Main category URL
        const categorySlug = getCategorySlug(category);
        if (categorySlug) {
          urls.push(`
  <url>
    <loc>${baseUrl}/product-category/${categorySlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
        }

        // Sub-category URLs
        if (category.children && category.children.length > 0) {
          category.children.forEach(subCategory => {
            const subCategorySlug = getCategorySlug(subCategory);
            if (subCategorySlug) {
              urls.push(`
  <url>
    <loc>${baseUrl}/product-category/${categorySlug}/${subCategorySlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
            }
          });
        }
      });
      
      return urls.join('');
    };

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  
  ${categoriesData.length > 0 && categoriesData[0].children ? generateCategoryUrls(categoriesData[0].children) : ''}
  
  ${products.map(product => `
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Error generating sitemap' });
  }
} 