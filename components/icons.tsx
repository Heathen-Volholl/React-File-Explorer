
import React from 'react';
import {
  Clipboard, Type, Image, Code, Link, Mail, Phone, Palette, File, Trash2, Tag, Search, Settings, X, Copy, Check, ChevronDown, Plus, BrainCircuit, Languages, Wand2, Star, AlertTriangle
} from 'lucide-react';
import { ItemType } from '../types';

interface IconProps {
  className?: string;
}

export const ItemTypeIcon: React.FC<{ type: ItemType; className?: string }> = ({ type, className = "w-4 h-4" }) => {
  switch (type) {
    case ItemType.TEXT:
      return <Type className={className} />;
    case ItemType.IMAGE:
      return <Image className={className} />;
    case ItemType.CODE:
      return <Code className={className} />;
    case ItemType.LINK:
      return <Link className={className} />;
    case ItemType.EMAIL:
      return <Mail className={className} />;
    case ItemType.PHONE:
      return <Phone className={className} />;
    case ItemType.COLOR:
      return <Palette className={className} />;
    case ItemType.FILE:
        return <File className={className} />;
    default:
      return <Clipboard className={className} />;
  }
};

export const Icons = {
  Clipboard: (props: IconProps) => <Clipboard {...props} />,
  Trash: (props: IconProps) => <Trash2 {...props} />,
  Tag: (props: IconProps) => <Tag {...props} />,
  Search: (props: IconProps) => <Search {...props} />,
  Settings: (props: IconProps) => <Settings {...props} />,
  Close: (props: IconProps) => <X {...props} />,
  Copy: (props: IconProps) => <Copy {...props} />,
  Check: (props: IconProps) => <Check {...props} />,
  ChevronDown: (props: IconProps) => <ChevronDown {...props} />,
  Plus: (props: IconProps) => <Plus {...props} />,
  Brain: (props: IconProps) => <BrainCircuit {...props} />,
  Translate: (props: IconProps) => <Languages {...props} />,
  Format: (props: IconProps) => <Wand2 {...props} />,
  Star: (props: IconProps) => <Star {...props} />,
  Warning: (props: IconProps) => <AlertTriangle {...props} />,
};
