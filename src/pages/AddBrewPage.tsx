import { useNavigate } from 'react-router-dom';
import { BrewingForm, BrewFormValues } from '../components/brewing/BrewingForm';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AddBrewPage() {
  const navigate = useNavigate();
  const { addEntry } = useBrewingEntries();

  const handleSubmit = (data: BrewFormValues) => {
    const now = new Date().toISOString();
    addEntry({
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      coffeeProducer: data.coffeeProducer,
      countryOfOrigin: data.countryOfOrigin,
      grindCoarseness: data.grindCoarseness,
      grindEquipment: data.grindEquipment,
      brewingMethod: data.brewingMethod,
      gramsOfCoffee: data.gramsOfCoffee,
      millilitersOfWater: data.millilitersOfWater,
      waterSource: data.waterSource,
      numberOfPeople: data.numberOfPeople,
      brewTimeSeconds: data.brewMinutes * 60 + data.brewSeconds,
      rating: data.rating,
      comment: data.comment,
      guestRatings: data.guestRatings,
    });
    navigate('/');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Back to list">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Log a Brew</h1>
        </div>
        <BrewingForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
}
