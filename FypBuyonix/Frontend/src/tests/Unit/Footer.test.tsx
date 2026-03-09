import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../components/Footer';

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

describe('Footer Unit Tests', () => {
  it('should render the BUYONIX brand name', () => {
    renderFooter();
    expect(screen.getByText('BUYONIX')).toBeInTheDocument();
  });

  it('should render the company description', () => {
    renderFooter();
    expect(
      screen.getByText(/Experience the future of online shopping/i)
    ).toBeInTheDocument();
  });

  it('should render Quick Links section', () => {
    renderFooter();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Become a Seller')).toBeInTheDocument();
  });

  it('should render Support section', () => {
    renderFooter();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Customer Support')).toBeInTheDocument();
    expect(screen.getByText('Track Order')).toBeInTheDocument();
    expect(screen.getByText('Returns & Refunds')).toBeInTheDocument();
    expect(screen.getByText('Shipping Info')).toBeInTheDocument();
    expect(screen.getByText('FAQs')).toBeInTheDocument();
  });

  it('should render Contact Us section', () => {
    renderFooter();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText(/Air University E9 Islamabad/)).toBeInTheDocument();
    expect(screen.getByText(/\+92 300 0579453/)).toBeInTheDocument();
    expect(screen.getByText(/support@buyonix\.com/)).toBeInTheDocument();
  });

  it('should render the newsletter subscribe section', () => {
    renderFooter();
    expect(screen.getByText('Subscribe to Our Newsletter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('should render the copyright notice', () => {
    renderFooter();
    expect(screen.getByText(/© 2025 Buyonix. All rights reserved/)).toBeInTheDocument();
  });

  it('should render Privacy Policy link', () => {
    renderFooter();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should render Terms of Service link', () => {
    renderFooter();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('should render Cookie Policy link', () => {
    renderFooter();
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
  });

  it('should have 4 social media icons', () => {
    renderFooter();
    // The social icons are SVGs inside SocialIcon divs
    const socialContainer = screen.getByText('BUYONIX').closest('div')?.parentElement;
    const svgs = socialContainer?.querySelectorAll('svg');
    // There are 4 social icons (Facebook, Twitter, Instagram, YouTube)
    expect(svgs && svgs.length >= 4).toBe(true);
  });
});
