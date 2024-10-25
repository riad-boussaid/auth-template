export const Footer = () => {
  const year = new Date().getFullYear().toString();

  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground">
        All rights reserved &copy; {year}
      </p>
    </div>
  );
};
