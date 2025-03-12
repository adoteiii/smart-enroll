"use client";

import { FC, ReactNode } from "react";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      {children}
      {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider> */}
    </>
  );
};

export default Providers;
