import { useParams, Redirect } from 'wouter';
import { getServiceDetails } from '@/config/service-details';
import { serviceAnchor, serviceCategories } from '@/config/services';
import { ServiceDetailPage } from '@/components/service-detail-page';
import NotFound from '@/pages/not-found';

export default function ServiceDetailRoute() {
  const params = useParams<{ category: string; service: string }>();
  
  // verify category exists
  const category = serviceCategories.find(c => c.slug === params.category);
  if (!category) {
    return <Redirect to="/services" replace />;
  }

  // verify service exists in the category
  const serviceDef = category.services.find(s => serviceAnchor(s.name) === params.service);
  if (!serviceDef) {
    return <Redirect to={`/services/${category.slug}`} replace />;
  }

  // get details
  const details = getServiceDetails(serviceDef.name, params.service);

  return <ServiceDetailPage key={serviceDef.name} category={category} service={serviceDef} details={details} />;
}
