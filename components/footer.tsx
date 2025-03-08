export const Footer = () => {
  const year = new Date().getFullYear().toString();

  return (
    <div className="border-t py-8 ">
      <div className="container">
        <p className="text-sm text-muted-foreground text-center">
          All rights reserved &copy; {year}
        </p>
      </div>
    </div>
  );
};
