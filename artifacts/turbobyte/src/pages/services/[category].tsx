import { useParams, Redirect } from 'wouter';
import { ServiceCategoryPage } from '@/components/service-category-page';
import { getCategoryBySlug, legacyServiceRedirects } from '@/config/services';
import NotFound from '@/pages/not-found';

/**
 * Dynamic route for the six official service category pages.
 * Legacy slugs from the previous site structure redirect to the closest
 * official category so old links keep working.
 */
export default function ServiceCategoryRoute() {
  const params = useParams<{ category: string }>();
  const slug = params.category ?? '';

  const legacyTarget = legacyServiceRedirects[slug];
  if (legacyTarget) {
    return <Redirect to={`/services/${legacyTarget}`} replace />;
  }

  const category = getCategoryBySlug(slug);
  if (!category) {
    return <NotFound />;
  }

  return <ServiceCategoryPage key={category.slug} category={category} />;
}
