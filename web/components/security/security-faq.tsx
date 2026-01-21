import { ChevronDown } from "lucide-react";

export default function SecurityFAQ() {
	return (
	<section className="w-full px-4 py-20 bg-white dark:bg-background-dark">
		<div className="max-w-[720px] mx-auto flex flex-col gap-10">
			<div className="text-center flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-primary dark:text-white">Frequently Asked Questions</h1>
				<p className="text-neutral-500 dark:text-neutral-400">Common questions about our security architecture.
				</p>
			</div>
			<div className="flex flex-col gap-4">
				{/* <!-- Question 1 --> */}
				<details className="group rounded-lg border border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
					<summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-lg text-primary dark:text-white select-none">
						Can Inverx reset my password if I lose it?
						<span className="material-symbols-outlined transition-transform ease-in-out duration-300 group-open:-rotate-180"><ChevronDown /></span>
					</summary>
					<div className="px-6 pb-6 pt-0 text-neutral-600 dark:text-neutral-300 leading-relaxed">
						No. Because we use zero-knowledge encryption, your password is the key to decrypt your data.
						We never store your password in plain text or have access to your private keys. If you lose
						your password and recovery code, your data is irretrievable, even by us.
					</div>
				</details>
				{/* <!-- Question 2 --> */}
				<details
					className="group rounded-lg border border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
					<summary
						className="flex cursor-pointer items-center justify-between p-6 font-bold text-lg text-primary dark:text-white select-none">
						How do you handle government data requests?
						<span
							className="material-symbols-outlined transition-transform ease-in-out duration-300 group-open:-rotate-180"><ChevronDown /></span>
					</summary>
					<div className="px-6 pb-6 pt-0 text-neutral-600 dark:text-neutral-300 leading-relaxed">
						If legally compelled, we can only turn over the encrypted blob of data we have. Since we do
						not possess the decryption keys, we cannot provide readable emails to any third party,
						government or otherwise.
					</div>
				</details>
				{/* <!-- Question 3 --> */}
				<details
					className="group rounded-lg border border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
					<summary
						className="flex cursor-pointer items-center justify-between p-6 font-bold text-lg text-primary dark:text-white select-none">
						Is Inverx open source?
						<span
							className="material-symbols-outlined transition-transform ease-in-out duration-300 group-open:-rotate-180"><ChevronDown /></span>
					</summary>
					<div className="px-6 pb-6 pt-0 text-neutral-600 dark:text-neutral-300 leading-relaxed">
						Our client-side cryptographic libraries are open source, allowing independent auditors to
						verify that encryption happens exactly as we claim before data leaves your browser.
					</div>
				</details>
			</div>
		</div>
	</section>
)
}