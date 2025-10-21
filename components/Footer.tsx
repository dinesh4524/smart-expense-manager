import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4">
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} dinesh c. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;