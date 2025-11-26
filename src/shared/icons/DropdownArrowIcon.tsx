import type { FC, SVGProps } from 'react';

type DropdownArrowIconProps = SVGProps<SVGSVGElement> & {
  isOpen?: boolean;
};

export const DropdownArrowIcon: FC<DropdownArrowIconProps> = ({
  isOpen = false,
  ...props
}) => {
  return (
    <svg
      width="14.003"
      height="6.998"
      viewBox="0 0 14.003 6.998"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
      {...props}
    >
      <path
        d="M6.99758 6.9981L0 0.691349L0.536532 0.000148296L6.99789 5.89066L13.4668 0L14.003 0.691497L6.99758 6.9981Z"
        fill="#5E5D67"
        fillRule="evenodd"
      />
    </svg>
  );
};

