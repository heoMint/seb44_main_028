export type CategoryButtonProps = {
  imageUrl: string;
  imageName: string;
};
export type ModalPortalProps = {
  children: React.ReactNode;
};
export type ModalFrameProps = {
  leftButtonText: string;
  rightButtonText: string;
  children: React.ReactNode;
  setOnModal: (state: boolean) => void;
};
export type SelectOption = {
  value: string;
  label: string;
};
export type CategoryProp = {
  image: string;
  name: string;
};
