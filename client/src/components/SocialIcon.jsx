import React from 'react';
import { FaFacebook, FaGithub, FaGlobe, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook', Icon: FaFacebook },
  { value: 'linkedin', label: 'LinkedIn', Icon: FaLinkedin },
  { value: 'github', label: 'GitHub', Icon: FaGithub },
  { value: 'twitter', label: 'X (Twitter)', Icon: FaXTwitter },
  { value: 'instagram', label: 'Instagram', Icon: FaInstagram },
  { value: 'youtube', label: 'YouTube', Icon: FaYoutube },
  { value: 'website', label: 'Website', Icon: FaGlobe },
];

export const socialLabel = (platform) =>
  SOCIAL_PLATFORMS.find((item) => item.value === platform)?.label || 'Link';

const SocialIcon = ({ platform }) => {
  const Icon = SOCIAL_PLATFORMS.find((item) => item.value === platform)?.Icon || FaGlobe;
  return <Icon aria-hidden="true" />;
};

export default SocialIcon;
