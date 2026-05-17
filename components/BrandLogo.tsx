
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import logoImage from './rr-stack-cream.png';

interface BrandLogoProps {
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "" }) => {
  return (
    <div className={`${className} select-none flex items-center justify-center`}>
       <img 
         src={logoImage} 
         alt="Rise + Render" 
         className="h-full w-auto object-contain" 
       />
    </div>
  );
};

export default BrandLogo;
