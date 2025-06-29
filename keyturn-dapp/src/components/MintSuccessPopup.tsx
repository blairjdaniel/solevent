import React from 'react';
import styled from 'styled-components';

interface MintSuccessPopupProps {
  isVisible: boolean;
  onClose: () => void;
  mintedNftId?: string;
}

const PopupOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const PopupContent = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #ffd700;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: popupSlideIn 0.5s ease-out;

  @keyframes popupSlideIn {
    from {
      opacity: 0;
      transform: translateY(-50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid #ffd700;
  color: #ffd700;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;
  pointer-events: auto;

  &:hover {
    background: rgba(255, 215, 0, 0.3);
    transform: scale(1.1);
    color: #fff;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SuccessIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 1s ease-in-out;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  }
`;

const Title = styled.h1`
  color: #ffd700;
  font-size: 32px;
  margin-bottom: 15px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const Subtitle = styled.h2`
  color: #00ff88;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
`;

const Description = styled.p`
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const NftImage = styled.div`
  width: 150px;
  height: 150px;
  margin: 0 auto 25px;
  border-radius: 15px;
  overflow: hidden;
  border: 3px solid #ffd700;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MintId = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid #ffd700;
  border-radius: 10px;
  padding: 15px;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #ffd700;
  word-break: break-all;
`;

const ActionButton = styled.button`
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #000;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MintSuccessPopup: React.FC<MintSuccessPopupProps> = ({ 
  isVisible, 
  onClose, 
  mintedNftId 
}) => {
  if (!isVisible) return null;
  
  console.log("🚀 MintSuccessPopup rendered!", { mintedNftId });
  
  const handleClose = () => {
    console.log("🔴 Close button clicked!");
    onClose();
  };
  
  const handleOverlayClick = () => {
    console.log("🔴 Overlay clicked!");
    onClose();
  };

  const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || "SolEvent";
  const collectionDescription = process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTION || "Welcome to the community!";
  
  return (
    <PopupOverlay $isVisible={isVisible} onClick={handleOverlayClick}>
      <PopupContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>
        
        <SuccessIcon>🎉</SuccessIcon>
        
        <Title>Congratulations!</Title>
        <Subtitle>You Minted {collectionName}</Subtitle>
        
        <Description>
          {collectionDescription} Your {collectionName} NFT has been successfully minted 
          and is now part of your digital collection.
        </Description>
        
        <NftImage>
          <img src="/images/placeholder.png" alt={`${collectionName} NFT`} />
        </NftImage>
        
        {mintedNftId && (
          <MintId>
            <strong>Mint ID:</strong><br />
            {mintedNftId}
          </MintId>
        )}
        
        <div>
          <ActionButton onClick={handleClose}>
            View My Collection
          </ActionButton>
          <ActionButton onClick={handleClose}>
            Share
          </ActionButton>
        </div>
      </PopupContent>
    </PopupOverlay>
  );
};

export default MintSuccessPopup; 