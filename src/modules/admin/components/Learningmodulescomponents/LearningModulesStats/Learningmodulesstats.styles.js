import styled from "styled-components";
import theme from "../../../../../theme/Theme";

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  background: ${theme.colors.sidebarBgColor};
  padding: ${theme.spacing(2)};
  border-radius: 8px;

  h2 {
    font-family: ${theme.fonts.heading};
    color: ${theme.colors.sidebarTextColor};
  }

  > div {
    display: flex;
    gap: ${theme.spacing(2)};
    // justify-content: space-between;
    flex-wrap: wrap;

    @media (max-width: ${theme.breakpoints.tablet}) {
      flex-direction: column;
    }
  }
`;

export const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing(2)};

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;
export const StatCard = styled.div`
  background: ${theme.colors.light};
  padding: ${theme.spacing(1)};
  border-radius: 8px;

  h1 {
    font-family: ${theme.fonts.heading};
    }

  p {
    margin: 0;
    color: ${theme.colors.textgray};
  }
`;

export const StatCard1 = styled.div`
  display: flex;
  gap: ${theme.spacing(2)};
  background: ${theme.colors.light};
  padding: ${theme.spacing(1)};
  border-radius: 8px;
  text-align: center;
  // margin-left: -60px;

  h3 {
    color: ${theme.colors.primary};
    font-family: ${theme.fonts.heading};
  }

  p {
    margin: 0;
    border: 2px solid ${theme.colors.borderbrown};
    border-radius: 4px;
    padding: 2px;
    font-size: 12px;
    background: ${theme.colors.lightbrown};
  }
`;

export const StatCard2 = styled.div`
  display: flex;
  gap: ${theme.spacing(2)};
  background: ${theme.colors.light};
  padding: ${theme.spacing(1)};
  border-radius: 8px;
  text-align: center;
  // margin-left: -60px;

  h3 {
    color: ${theme.colors.primary};
    font-family: ${theme.fonts.heading};
  }

  p {
    margin: 0;
    border: 2px solid ${theme.colors.borderblue};
    border-radius: 4px;
    padding: 2px;
    font-size: 12px;
    background: ${theme.colors.lightblue};
  }
`;
