"use client";
import React, { useEffect } from 'react';
import { db } from '@/config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import Logo from '@/app/_components/Logo';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';

function Header() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      saveUserData();
    }
  }, [user]);

  const saveUserData = async () => {
    const docId = user?.primaryEmailAddress?.emailAddress;
    const role = 'user'; // Default role

    try {
      await setDoc(doc(db, 'users', docId), {
        name: user?.fullName,
        avatar: user?.imageUrl,
        email: user?.primaryEmailAddress?.emailAddress,
        role: role,  // Default to 'user'
      });
    } catch (e) {
      console.error("Error saving user data:", e);
    }
  };

  return (
    <div className='flex justify-between items-center p-3 shadow-sm'>
      <Logo />
      <OrganizationSwitcher
        afterLeaveOrganizationUrl={'/dashboard'}
        afterCreateOrganizationUrl={'/dashboard'} 
      />
      <UserButton />
    </div>
  );
}

export default Header;
