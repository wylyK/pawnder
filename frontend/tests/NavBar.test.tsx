import { render, screen } from '@testing-library/react';
import NavBar from '../src/components/Navigation/NavBar'; // Adjust path if needed
import UserContext from '@/context/UserContext'; // Default import
import { useRouter } from 'next/navigation'; // Import Next.js useRouter (for App Router)
import '@testing-library/jest-dom'; // Import jest-dom to enable the custom matchers

// Mock Next.js useRouter hook from next/navigation (for App Router in Next.js 13)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(), // Mock useRouter explicitly with jest.fn()
}));

test('renders NavBar component', () => {
  // Mock the useRouter hook to simulate navigation behavior
  (useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),  // Mock push method for navigation
    pathname: '/',    // Mock the pathname (or use any path relevant to the test)
    query: {},        // Mock any additional properties from the router if needed
  });

  render(
    <UserContext.Provider value={{ user: null, setUser: jest.fn() }}>
      <NavBar />
    </UserContext.Provider>
  );    

  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(4); // Ensure all 4 links are present

    // Check if each link has the correct `href`
  expect(links.some((link) => link.getAttribute("href") === "/")).toBe(true);
  expect(links.some((link) => link.getAttribute("href") === "/matchmaker")).toBe(true);
  expect(links.some((link) => link.getAttribute("href") === "/calendar")).toBe(true);
  expect(links.some((link) => link.getAttribute("href") === "/profile")).toBe(true);

    // Check the logout button
  expect(screen.getByRole("button")).toBeInTheDocument();
});