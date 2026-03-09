import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import type { CartContextType } from '../context/CartContextType';
import VisualSearch from '../components/VisualSearch';

// ─── Mock navigator.mediaDevices ────────────────────────────────────────────
const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// ─── Mock Data ──────────────────────────────────────────────────────────────
const mockSearchResults = {
  success: true,
  results: [
    {
      product: {
        _id: 'vs-prod-1',
        name: 'Blue Running Shoes',
        price: 89.99,
        images: ['https://example.com/shoes.jpg'],
        category: 'Footwear',
        description: 'Comfortable running shoes',
      },
      similarity: 0.92,
    },
    {
      product: {
        _id: 'vs-prod-2',
        name: 'Sports Sneakers',
        price: 65.0,
        images: ['https://example.com/sneakers.jpg'],
        category: 'Footwear',
        description: 'Casual sneakers',
      },
      similarity: 0.85,
    },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const mockAddToCart = vi.fn();
const mockOnClose = vi.fn();

const createMockCartContext = (): CartContextType => ({
  isCartOpen: false,
  setIsCartOpen: vi.fn(),
  cartItems: [],
  addToCart: mockAddToCart,
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  updatePrice: vi.fn(),
  clearCart: vi.fn(),
});

const renderVisualSearch = (isOpen = true) => {
  return render(
    <MemoryRouter>
      <CartContext.Provider value={createMockCartContext()}>
        <VisualSearch isOpen={isOpen} onClose={mockOnClose} />
      </CartContext.Provider>
    </MemoryRouter>
  );
};

// ─── FileReader mock helper ─────────────────────────────────────────────────
// Creates a mock FileReader class that synchronously triggers onload
// when readAsDataURL is called, so the component transitions to preview mode.
const OriginalFileReader = globalThis.FileReader;

function mockFileReaderGlobal(fakeDataUrl = 'data:image/png;base64,abc123') {
  class MockFileReader {
    result: string | null = null;
    onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
    onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
    readAsDataURL(_file: Blob) {
      this.result = fakeDataUrl;
      // Invoke onload on next microtick so the component has set it
      setTimeout(() => {
        if (this.onload) {
          this.onload({
            target: { result: fakeDataUrl },
          } as unknown as ProgressEvent<FileReader>);
        }
      }, 0);
    }
    // stubs for other methods the environment might check
    readAsText() {}
    readAsArrayBuffer() {}
    readAsBinaryString() {}
    abort() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return false; }
    EMPTY = 0;
    LOADING = 1;
    DONE = 2;
    error = null;
    onabort = null;
    onloadstart = null;
    onloadend = null;
    onprogress = null;
    readyState = 0;
  }
  vi.stubGlobal('FileReader', MockFileReader);
}

/** Simulate picking a file, with FileReader mocked to auto-trigger onload */
async function simulateFileUpload(fakeDataUrl = 'data:image/png;base64,abc123') {
  mockFileReaderGlobal(fakeDataUrl);

  const file = new File(['img'], 'photo.png', { type: 'image/png' });
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

  fireEvent.change(fileInput, { target: { files: [file] } });

  // Wait for the component to transition to preview mode
  await waitFor(() => expect(screen.getByText(/Find Similar/)).toBeInTheDocument());
}

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('VisualSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original FileReader after each test
    vi.stubGlobal('FileReader', OriginalFileReader);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Does not render when closed
  // ──────────────────────────────────────────────────────────────────────────
  it('should not render anything when isOpen is false', () => {
    const { container } = renderVisualSearch(false);
    expect(container.firstChild).toBeNull();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Renders modal when open
  // ──────────────────────────────────────────────────────────────────────────
  it('should render the modal with header when isOpen is true', () => {
    renderVisualSearch(true);
    expect(screen.getByText('Visual Search')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Shows mode selection buttons
  // ──────────────────────────────────────────────────────────────────────────
  it('should display "Take Photo" and "Upload Image" buttons in select mode', () => {
    renderVisualSearch();
    expect(screen.getByText('Take Photo')).toBeInTheDocument();
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Close button calls onClose
  // ──────────────────────────────────────────────────────────────────────────
  it('should call onClose when close button is clicked', async () => {
    renderVisualSearch();
    // The close button contains the FaTimes icon, find the button in the header
    const header = screen.getByText('Visual Search').closest('div');
    const closeButton = header?.querySelector('button');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Camera error handling
  // ──────────────────────────────────────────────────────────────────────────
  it('should show error message when camera access fails', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    renderVisualSearch();

    const takePhotoBtn = screen.getByText('Take Photo');
    fireEvent.click(takePhotoBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Could not access camera. Please check permissions or try uploading an image.')
      ).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: File upload shows preview
  // ──────────────────────────────────────────────────────────────────────────
  it('should switch to preview mode when a valid image file is uploaded', async () => {
    renderVisualSearch();

    await simulateFileUpload('data:image/png;base64,dummybase64data');

    expect(screen.getByText(/Find Similar/)).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Reject non-image files
  // ──────────────────────────────────────────────────────────────────────────
  it('should show error for non-image file upload', async () => {
    renderVisualSearch();

    const file = new File(['text-content'], 'document.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Please select an image file')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: Successful visual search shows results
  // ──────────────────────────────────────────────────────────────────────────
  it('should display search results after successful visual search', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    } as Response);

    renderVisualSearch();

    await simulateFileUpload();

    // Click the search button
    fireEvent.click(screen.getByText(/Find Similar/));

    await waitFor(() => {
      expect(screen.getByText('Blue Running Shoes')).toBeInTheDocument();
      expect(screen.getByText('Sports Sneakers')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 10: Similarity percentage display
  // ──────────────────────────────────────────────────────────────────────────
  it('should display similarity percentage for each result', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    } as Response);

    renderVisualSearch();

    await simulateFileUpload();

    fireEvent.click(screen.getByText(/Find Similar/));

    await waitFor(() => {
      expect(screen.getByText('92% match')).toBeInTheDocument();
      expect(screen.getByText('85% match')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 11: Search failure error message
  // ──────────────────────────────────────────────────────────────────────────
  it('should show error when search API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

    renderVisualSearch();

    await simulateFileUpload();

    fireEvent.click(screen.getByText(/Find Similar/));

    await waitFor(() => {
      expect(
        screen.getByText('Could not connect to search service. Please ensure the server is running.')
      ).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 12: Results count display
  // ──────────────────────────────────────────────────────────────────────────
  it('should display correct results count', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    } as Response);

    renderVisualSearch();

    await simulateFileUpload();

    fireEvent.click(screen.getByText(/Find Similar/));

    await waitFor(() => {
      expect(screen.getByText('Similar Products (2)')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 13: Hidden file input has correct accept attribute
  // ──────────────────────────────────────────────────────────────────────────
  it('should have a hidden file input that accepts images only', () => {
    renderVisualSearch();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    expect(fileInput.accept).toBe('image/*');
    expect(fileInput.className).toContain('hidden');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 14: "Search Again" button after results
  // ──────────────────────────────────────────────────────────────────────────
  it('should show "Search Again" button after results are displayed', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    } as Response);

    renderVisualSearch();

    await simulateFileUpload();

    fireEvent.click(screen.getByText(/Find Similar/));

    await waitFor(() => {
      expect(screen.getByText('Search Again')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 15: No results message
  // ──────────────────────────────────────────────────────────────────────────
  it('should show "no similar products" message when results are empty', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, results: [] }),
    } as Response);

    renderVisualSearch();

    await simulateFileUpload();

    fireEvent.click(screen.getByText(/Find Similar/));

    await waitFor(() => {
      expect(
        screen.getByText('No similar products found. Try a different image.')
      ).toBeInTheDocument();
    });
  });
});

