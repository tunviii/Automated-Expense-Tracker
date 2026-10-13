import type { TransactionCategory } from "@/types/transaction";

export type CategoryDefinition = {
  id: string;
  label: TransactionCategory;
  icon: string;
};

export const categories: CategoryDefinition[] = [
  { id: "food-dining", label: "Food & Dining", icon: "🍽️" },
  { id: "groceries", label: "Groceries", icon: "🛒" },
  { id: "transport", label: "Transport", icon: "🚆" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "subscription", label: "Subscription", icon: "◉" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "healthcare", label: "Healthcare", icon: "✚" },
  { id: "bills-utilities", label: "Bills & Utilities", icon: "⚡" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "personal-care", label: "Personal Care", icon: "✦" },
  { id: "rent-accommodation", label: "Rent & Accommodation", icon: "⌂" },
  { id: "transfer", label: "Transfer", icon: "↗" },
  { id: "others", label: "Others", icon: "•••" },
];

export const categoryByLabel = Object.fromEntries(
  categories.map((category) => [category.label, category]),
) as Record<TransactionCategory, CategoryDefinition>;
