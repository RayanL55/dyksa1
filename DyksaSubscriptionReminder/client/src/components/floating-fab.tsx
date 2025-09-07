import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingFab() {
  const handleClick = () => {
    window.location.href = "/add-subscription";
  };

  return (
    <Button
      size="icon"
      className="fixed bottom-[90px] right-5 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
      onClick={handleClick}
      data-testid="button-add-subscription"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}
