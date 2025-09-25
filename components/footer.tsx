export const Footer = () => {
  const year = new Date().getFullYear().toString();

  return (
    <div className="border-t py-8">
      <div className="container">
        <p className="text-muted-foreground text-center text-sm">
          All rights reserved &copy; {year}
        </p>
      </div>
    </div>
  );
};
