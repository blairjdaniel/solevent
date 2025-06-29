export function CollectionImage() {
  const collectionImageUrl = process.env.NEXT_PUBLIC_COLLECTION_IMAGE_URL || "/images/placeholder.png";
  const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || "SolEvent";
  
  return (
    <img
      src={collectionImageUrl}
      alt={collectionName}
      width={896}
      height={504}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    />
  );
}