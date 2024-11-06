function FeatureCollection({children} : {children: React.ReactNode}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] auto-rows-[minmax(216px,auto)] gap-4">
      {children}
    </div>
  );
}

export default FeatureCollection;