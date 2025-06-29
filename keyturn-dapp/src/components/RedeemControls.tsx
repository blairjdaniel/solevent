import React, { useState, useEffect } from 'react';
import { useRedeemProgram } from '../hooks/useRedeemProgram';
import { useNftMetadata } from '../hooks/useNftMetadata';

interface RedeemControlsProps {
  mintAddress: string;
  image?: string;
  metadata?: any;
}

export function RedeemControls({ mintAddress, image, metadata }: RedeemControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isNewlyMinted, setIsNewlyMinted] = useState(true); // Assume newly minted initially
  const { updateMetadata } = useRedeemProgram();
  const { isMutable, loading: metadataLoading } = useNftMetadata(mintAddress);
  const imageUrl = image || "/images/placeholder.png";

  // For newly minted NFTs, delay the metadata check to allow blockchain to settle
  useEffect(() => {
    if (isNewlyMinted) {
      const timer = setTimeout(() => {
        setIsNewlyMinted(false);
        console.log(`🕐 RedeemControls: NFT ${mintAddress} - Delayed metadata check completed`);
      }, 3000); // 3 second delay for newly minted NFTs
      
      return () => clearTimeout(timer);
    }
  }, [isNewlyMinted, mintAddress]);

  // Check if NFT is redeemed by monitoring the metadata status (only after delay for new NFTs)
  useEffect(() => {
    if (!isNewlyMinted && !metadataLoading && isMutable !== null) {
      console.log(`🔍 RedeemControls: NFT ${mintAddress} - isMutable: ${isMutable}, setting isRedeemed: ${isMutable === false}`);
      setIsRedeemed(isMutable === false);
    }
  }, [isMutable, metadataLoading, mintAddress, isNewlyMinted]);

  // Also check props metadata as fallback (only after delay for new NFTs)
  useEffect(() => {
    if (!isNewlyMinted && metadata && metadata.isMutable === false) {
      console.log(`🔍 RedeemControls: NFT ${mintAddress} - props metadata shows immutable, setting isRedeemed: true`);
      setIsRedeemed(true);
    }
  }, [metadata, mintAddress, isNewlyMinted]);

  const handleUpdateMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const signature = await updateMetadata(mintAddress);
      if (signature) {
        console.log('Metadata update successful:', signature);
        setIsRedeemed(true); // Mark as redeemed after successful update
        // The useNftMetadata hook will automatically re-fetch and update the status
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmRedeem = () => {
    setShowConfirmation(false);
    handleUpdateMetadata();
  };

  const handleCancelRedeem = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="redeem-controls" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="controls">
          <button 
            onClick={handleRedeemClick}
            disabled={loading || (isRedeemed && !isNewlyMinted) || (metadataLoading && !isNewlyMinted)}
            className={`update-metadata-btn ${isRedeemed ? 'redeemed' : ''}`}
          >
            {loading ? 'Updating...' : 
             metadataLoading ? 'Loading...' : 
             isNewlyMinted ? 'Update Metadata' : 
             isRedeemed ? 'Redeemed' : 'Update Metadata'}
          </button>
          {error && (
            <div className="error-message">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
        </div>
        <style jsx>{`
          .redeem-controls {
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: rgba(249, 249, 249, 0.9);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            width: 125px;
            height: 125px;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }
          .update-metadata-btn {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            box-shadow: 0 2px 4px rgba(79, 172, 254, 0.3);
            width: 100%;
            padding: 8px 12px;
            margin: 4px 0;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .update-metadata-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(79, 172, 254, 0.4);
          }
          .update-metadata-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          .update-metadata-btn.redeemed {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            cursor: not-allowed;
          }
          .error-message {
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 8px;
          }
        `}</style>
      </div>

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-popup">
            <h3>Confirm Redemption</h3>
            <p>Are you sure you want to redeem this NFT?</p>
            <p className="warning">This action will make the NFT immutable and cannot be undone.</p>
            <div className="confirmation-buttons">
              <button 
                onClick={handleConfirmRedeem}
                className="confirm-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Yes, Redeem'}
              </button>
              <button 
                onClick={handleCancelRedeem}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
          <style jsx>{`
            .confirmation-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1000;
            }
            .confirmation-popup {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
              max-width: 400px;
              width: 90%;
              text-align: center;
            }
            .confirmation-popup h3 {
              margin: 0 0 15px 0;
              color: #333;
              font-size: 20px;
            }
            .confirmation-popup p {
              margin: 10px 0;
              color: #666;
              line-height: 1.5;
            }
            .warning {
              color: #e74c3c !important;
              font-weight: 600;
              font-size: 14px;
            }
            .confirmation-buttons {
              display: flex;
              gap: 15px;
              justify-content: center;
              margin-top: 25px;
            }
            .confirm-btn {
              background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .confirm-btn:hover:not(:disabled) {
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
            }
            .confirm-btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .cancel-btn {
              background: #95a5a6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .cancel-btn:hover:not(:disabled) {
              background: #7f8c8d;
              transform: translateY(-1px);
            }
            .cancel-btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          `}</style>
        </div>
      )}
    </>
  );
} 