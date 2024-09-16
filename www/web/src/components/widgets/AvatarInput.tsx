import Image from "next/image";
import { useRef } from "react";
import { useFormikContext } from "formik";

import { MdAccountCircle, MdAdd, MdAddCircle } from "react-icons/md";

type AvatarProps = {
  name: string;
};

export default function AvatarInput({ name }: AvatarProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { values, setFieldValue } = useFormikContext<{ [key: string]: File }>();

  const avatar = values[name];

  return (
    <div className="m-auto">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) setFieldValue(name, files.item(0));
        }}
      />
      <div
        className="cursor-pointer rounded-full bg-secondary/10 p-2"
        onClick={() => fileRef.current?.click()}
      >
        <div className="relative">
          {values[name] ? (
            <Image
              src={
                typeof avatar === "string"
                  ? avatar
                  : URL.createObjectURL(avatar)
              }
              alt="Preview"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <MdAccountCircle className="text-4xl text-white/75" />
          )}
          <div className="absolute rounded-full bg-amber text-black -right-2 -top-2">
            <MdAdd className="text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
