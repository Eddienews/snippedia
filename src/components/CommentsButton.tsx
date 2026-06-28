
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ui/use-toast';

interface CommentsButtonProps {
  className?: string;
}

const CommentsButton = ({ className = '' }: CommentsButtonProps) => {
  const { toast } = useToast();

  // Component is now hidden - returning null to remove from UI
  return null;
};

export default CommentsButton;
