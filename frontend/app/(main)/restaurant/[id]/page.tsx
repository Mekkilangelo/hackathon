export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 text-center">
      <p className="text-muted-foreground text-sm">Fiche restaurant {id} — Epic 6</p>
    </div>
  );
}
