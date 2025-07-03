"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const featuredBooks = [
	{
		title: "Xam idea Class 10 Mathematics (2025-26)",
		img: "//vkpublications.com/cdn/shop/files/10-maths.jpg?v=1749452063",
	},
	{
		title: "Xam idea Class 12 Mathematics (2025-26)",
		img: "https://vkpublications.com/cdn/shop/files/9789356124233.jpg?v=1749540189&width=1000",
	},
	{
		title: "Xam idea Class 12 Physics (2025–26)",
		img: "https://vkpublications.com/cdn/shop/files/9789356129085.jpg?v=1750235174&width=832",
	},
	{
		title: "Xam idea Class 12 Chemistry (2025–26)",
		img: "https://vkpublications.com/cdn/shop/files/9789356123465.jpg?v=1749636505&width=832",
	},
	{
		title: " Xam idea Class 11 Chemistry (2025-26)",
		img: "https://vkpublications.com/cdn/shop/files/11-chemistry.jpg?v=1749452666&width=832",
	},
	{
		title: "Xam idea Class 12 Biology (2025-26)",
		img: "https://vkpublications.com/cdn/shop/files/9789356124479.jpg?v=1750240240&width=832",
	},
	{
		title: "Xam idea Class 11 Physics (2025-26)",
		img: "https://vkpublications.com/cdn/shop/files/11-phy.jpg?v=1749452288&width=832",
	},
];

const recommendedBooks = [
	{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE 2025-26 Syllabus Class 11th Vol. 1, 2",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-11-2.jpg?v=1744804001&width=1000",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-11th-vol-1-2-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=fe6295118&pr_rec_pid=9866708680986&pr_ref_pid=9764102766874&pr_seq=uniform" // example link
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE Class 12th Vol. 1, 2 & 3",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-12_1_b9535664-5823-4f44-af45-0d80c810d88a.jpg?v=1739599811",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-12th-vol-1-2-3-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=7652e2f0c&pr_rec_pid=9729296957722&pr_ref_pid=9866708680986&pr_seq=uniform"
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Class 9th CBSE Textbook and Addendum",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-9_2.jpg?v=1748239248&width=832",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-class-9th-cbse-textbook-and-addendum-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=1a3116758&pr_rec_pid=9764102766874&pr_ref_pid=9729296957722&pr_seq=uniform"
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE Class 10th Vol. 1 & 2",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/1_2_8cf8b71c-02c4-4748-bb0d-dee3547381ee.jpg?v=1733995950",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-10th-vol-1-2-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=jac&pr_rec_id=fe6295118&pr_rec_pid=9706962452762&pr_ref_pid=9764102766874&pr_seq=uniform"
	},
		{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE 2025-26 Syllabus Class 11th Vol. 1, 2",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-11-2.jpg?v=1744804001&width=1000",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-11th-vol-1-2-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=fe6295118&pr_rec_pid=9866708680986&pr_ref_pid=9764102766874&pr_seq=uniform" // example link
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE Class 12th Vol. 1, 2 & 3",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-12_1_b9535664-5823-4f44-af45-0d80c810d88a.jpg?v=1739599811",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-12th-vol-1-2-3-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=7652e2f0c&pr_rec_pid=9729296957722&pr_ref_pid=9866708680986&pr_seq=uniform"
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Class 9th CBSE Textbook and Addendum",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-9_2.jpg?v=1748239248&width=832",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-class-9th-cbse-textbook-and-addendum-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=1a3116758&pr_rec_pid=9764102766874&pr_ref_pid=9729296957722&pr_seq=uniform"
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE Class 10th Vol. 1 & 2",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/1_2_8cf8b71c-02c4-4748-bb0d-dee3547381ee.jpg?v=1733995950",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-10th-vol-1-2-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=jac&pr_rec_id=fe6295118&pr_rec_pid=9706962452762&pr_ref_pid=9764102766874&pr_seq=uniform"
	},
		{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE 2025-26 Syllabus Class 11th Vol. 1, 2",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-11-2.jpg?v=1744804001&width=1000",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-11th-vol-1-2-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=fe6295118&pr_rec_pid=9866708680986&pr_ref_pid=9764102766874&pr_seq=uniform" // example link
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE Class 12th Vol. 1, 2 & 3",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-12_1_b9535664-5823-4f44-af45-0d80c810d88a.jpg?v=1739599811",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-12th-vol-1-2-3-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=7652e2f0c&pr_rec_pid=9729296957722&pr_ref_pid=9866708680986&pr_seq=uniform"
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Class 9th CBSE Textbook and Addendum",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/Class-9_2.jpg?v=1748239248&width=832",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-class-9th-cbse-textbook-and-addendum-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=e5_desc&pr_rec_id=1a3116758&pr_rec_pid=9764102766874&pr_ref_pid=9729296957722&pr_seq=uniform"
	},
	{
		title: "S.M.A.R.T. Minds Mathematics Textbook for CBSE Class 10th Vol. 1 & 2",
		author: "Parijat Jain (IIT Delhi & IIM Ahmedabad)",
		img: "https://vkpublications.com/cdn/shop/files/1_2_8cf8b71c-02c4-4748-bb0d-dee3547381ee.jpg?v=1733995950",
		rating: 4.9,
		price: 32,
		shopLink: "https://vkpublications.com/products/s-m-a-r-t-minds-mathematics-textbook-for-cbse-class-10th-vol-1-2-with-audio-visual-learning-resources-by-parijat-jain-iit-delhi-iim-ahmedabad?pr_prod_strat=jac&pr_rec_id=fe6295118&pr_rec_pid=9706962452762&pr_ref_pid=9764102766874&pr_seq=uniform"
	},
];

function BookGrid({ books, showAll, onClose }) {
	const columns = 4;
	const visibleBooks = showAll ? books : books.slice(0, 4);

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(4, 1fr)`,
				gap: "min(18px, 3vw)",
				marginBottom: showAll ? 24 : 0,
			}}
		>
			{visibleBooks.map((book) => (
				<div
					key={book.title}
					style={{
						background: "#fff",
						borderRadius: 16,
						boxShadow: "0 4px 18px 0 rgba(44, 62, 80, 0.10)", // stronger shadow for card effect
						padding: "18px 12px 22px 12px",
						minWidth: 180,
						maxWidth: 220,
						flex: "1 1 180px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "flex-start",
						margin: "0 auto",
						border: "1.5px solid #f2f2f2",
						transition: "box-shadow 0.18s",
					}}
				>
					<img
						src={book.img}
						alt={book.title}
						style={{
							width: 80,
							height: 115,
							objectFit: "cover",
							borderRadius: 8,
							marginBottom: 14,
							boxShadow: "0 2px 8px rgba(44,62,80,0.10)",
							background: "#f8f8f8"
						}}
					/>
					<div
						style={{
							fontWeight: 700,
							fontSize: 15,
							color: "#3a2e1a",
							textAlign: "center",
							marginBottom: 4,
						}}
					>
						{book.title}
					</div>
					<div
						style={{
							color: "#a08b6b",
							fontSize: 12,
							marginBottom: 6,
							textAlign: "center",
						}}
					>
						By : {book.author}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							marginBottom: 10,
						}}
					>
						<span
							style={{
								color: "#3b4a8b",
								fontWeight: 700,
							}}
						>
							{book.rating}
						</span>
						<span style={{ color: "#3b4a8b" }}>★</span>
						<span
							style={{
								color: "#3a2e1a",
								fontWeight: 500,
							}}
						>
							₹{book.price}
						</span>
					</div>
					<button
						style={{
							background: "#c97a2b",
							color: "#fff",
							border: "none",
							borderRadius: 6,
							padding: "8px 20px",
							fontWeight: 600,
							cursor: "pointer",
							fontSize: "1rem",
							marginTop: 4,
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							transition: "background 0.2s",
						}}
						onClick={() => window.open(book.shopLink || "https://vkpublications.com/", "_blank")}
					>
						Shop
					</button>
				</div>
			))}
		</div>
	);
}

export default function Home() {
	const router = useRouter();
	const [slideIdx, setSlideIdx] = useState(0);
	const [coverIdx, setCoverIdx] = useState(1);
	const visibleCount = 3;
	const [showAllBooks, setShowAllBooks] = useState(false);

	const handlePrev = () => {
		setSlideIdx((prev) =>
			prev === 0 ? featuredBooks.length - visibleCount : prev - 1
		);
	};
	const handleNext = () => {
		setSlideIdx((prev) =>
			prev >= featuredBooks.length - visibleCount ? 0 : prev + 1
		);
	};
	const handleCoverPrev = () => {
		setCoverIdx((prev) => (prev === 0 ? featuredBooks.length - 1 : prev - 1));
	};
	const handleCoverNext = () => {
		setCoverIdx((prev) => (prev === featuredBooks.length - 1 ? 0 : prev + 1));
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100vw",
				background: "#f6f7fa",
				fontFamily: "Georgia, 'Segoe UI', Arial, sans-serif",
				maxWidth: "100vw",
				margin: 0,
				boxSizing: "border-box"
			}}
		>
			{/* Navbar */}
			<div
				style={{
					width: "90%",
					background: "#f6f7fa",
					boxShadow: "0 2px 18px 0 rgba(44, 62, 80, 0.08)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 5vw",
					height: 60,
					position: "sticky",
					top: 0,
					zIndex: 10,
				}}
			>
				<div
					style={{
						fontWeight: 700,
						fontSize: 20,
						color: "#2d3652", // dark blue from the image
						letterSpacing: 1,
					}}
				>
					<img
						src="/vkpublications.png"
						alt="logo"
						style={{ height: 36, width: "auto", verticalAlign: "middle" }}
					/>
				</div>
				<div
					style={{
						display: "flex",
						gap: "min(2vw, 18px)",
						alignItems: "center",
					}}
				>
					{["Home", "E-book", "NCERT", "Our Vision", "About Us"].map((label, idx) => {
						let isActive = idx === 0;
						let props = {
							style: {
								background: isActive ? "#e8eaf6" : "transparent", // light blue for active
								border: isActive ? "1.5px solid #3b4a8b" : "1.5px solid transparent", // blue border
								color: isActive ? "#2d3652" : "#6b6f7a", // dark blue for active, gray for others
								fontWeight: isActive ? 700 : 500,
								fontSize: "1rem",
								padding: "0.5rem 1.7rem",
								borderRadius: "2rem",
								cursor: "pointer",
								transition: "all 0.18s cubic-bezier(.36,.07,.19,.97)",
								boxShadow: isActive ? "0 2px 12px #3b4a8b22" : "none",
								position: "relative",
								outline: "none",
								marginRight: 0,
							},
							onMouseEnter: e => {
								e.currentTarget.style.background = "#e8eaf6";
								e.currentTarget.style.color = "#2d3652";
								e.currentTarget.style.border = "1.5px solid #3b4a8b";
								e.currentTarget.style.fontWeight = 700;
								e.currentTarget.style.boxShadow = "0 2px 12px #3b4a8b22";
							},
							onMouseLeave: e => {
								e.currentTarget.style.background = isActive ? "#e8eaf6" : "transparent";
								e.currentTarget.style.color = isActive ? "#2d3652" : "#6b6f7a";
								e.currentTarget.style.border = isActive ? "1.5px solid #3b4a8b" : "1.5px solid transparent";
								e.currentTarget.style.fontWeight = isActive ? 700 : 500;
								e.currentTarget.style.boxShadow = isActive ? "0 2px 12px #3b4a8b22" : "none";
							}
						};
						// Routing logic
						if (label === "Home") {
							props.href = "#";
							props.onClick = e => { e.preventDefault(); router.push("/"); };
						} else if (label === "NCERT") {
							props.onClick = e => { e.preventDefault(); window.open("https://ncert.nic.in/textbook.php", "_blank"); };
						} else if (label === "About Us") {
							props.onClick = e => { e.preventDefault(); window.open("https://vkpublications.com/pages/vk", "_blank"); };
						} else {
							props.href = "#";
						}
						return (
							<button
								key={label}
								{...props}
							>
								{label}
								<span className="stars" style={{
									display: "none",
									position: "absolute",
									right: 10,
									top: 8,
									fontSize: 14,
									color: "#3b4a8b",
									transition: "filter 0.2s"
								}}>★</span>
							</button>
						);
					})}
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "min(2vw, 24px)",
					}}
				>
					<button
						style={{
							background: "rgba(59,74,139,0.7)", // glass effect with transparency
							color: "#fff",
							border: "none",
							borderRadius: 16, // more glassy
							padding: "10px 32px",
							fontWeight: 600,
							fontSize: 17,
							cursor: "pointer",
							boxShadow: "0 4px 24px 0 rgba(44,62,80,0.16), 0 1.5px 8px 0 rgba(59,74,139,0.10)", // glassy shadow
							transition: "background 0.2s, box-shadow 0.2s",
							backdropFilter: "blur(6px)", // glass blur
							WebkitBackdropFilter: "blur(6px)",
							position: "relative",
							overflow: "hidden",
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
						onMouseEnter={e => {
							e.currentTarget.style.background = "rgba(59,74,139,0.85)";
							e.currentTarget.style.boxShadow = "0 8px 32px 0 rgba(44,62,80,0.22), 0 2px 12px 0 rgba(59,74,139,0.18)";
						}}
						onMouseLeave={e => {
							e.currentTarget.style.background = "rgba(59,74,139,0.7)";
							e.currentTarget.style.boxShadow = "0 4px 24px 0 rgba(44,62,80,0.16), 0 1.5px 8px 0 rgba(59,74,139,0.10)";
						}}
						onClick={() => router.push("/login")}
					>
						Login
					</button>
					<style>{`
						@keyframes star-glow {
							0% { filter: drop-shadow(0 0 4px #fff7); opacity: 1; }
							100% { filter: drop-shadow(0 0 12px #fff); opacity: 0.7; }
						}
					`}</style>
				</div>
			</div>
			{/* Hero Section */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "flex-start",
					padding: "max(24px, 4vw) 0 max(18px, 2vw) 0",
					gap: "max(32px, 4vw)",
					flexWrap: "wrap",
					width: "80vw", // match the width of the book grid
					margin: "0 auto",
				}}
			>
				<div style={{ maxWidth: 400, flex: "1 1 320px" }}>
					<div
						style={{
							fontSize: "2.1rem", // reduce font size
							fontWeight: 600,
							color: "#3a2e1a",
							lineHeight: 1.1,
							marginBottom: 12,
						}}
					>
						Find Your
						<br />
						Next Book
					</div>
					<div
						style={{
							color: "#6d5c3d",
							fontSize: "1rem", // reduce font size
							marginBottom: 18,
						}}
					>
						Discover a world where every page brings a new adventure. At Paper
						Haven, we curate a diverse collection of books.
					</div>
					<button
						style={{
							background: "#c97a2b",
							color: "#fff",
							border: "none",
							borderRadius: 6,
							padding: "8px 20px", // reduce padding
							fontSize: "1rem",
							fontWeight: 600,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							transition: "background 0.2s",
						}}
						onClick={() => window.open("https://vkpublications.com/", "_blank")}
					>
						Explore Now &rarr;
					</button>
				</div>
				{/* Book Carousel */}
				<div style={{
					position: "relative",
					width: "min(700px, 100%)", // increased width
					height: 320, // increased height
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
				}}>
					<button
						onClick={handlePrev}
						style={{
							position: "absolute",
							left: -20,
							top: "50%",
							transform: "translateY(-50%)",
							background: "#fff",
							border: "1px solid #ccc",
							borderRadius: "50%",
							width: 32, // increased button size
							height: 32,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							zIndex: 2,
							fontSize: 18,
						}}
						aria-label="Previous"
					>
						&#8592;
					</button>
					<div
						style={{
							width: "min(660px, 95vw)", // increased carousel width
							height: 260, // increased carousel height
							overflow: "hidden",
							position: "relative",
						}}
					>
						<div
							style={{
								display: "flex",
								transition: "transform 0.5s cubic-bezier(.36,.07,.19,.97)",
								transform: `translateX(-${slideIdx * 140}px)`, // adjust for larger cards
								width: `${featuredBooks.length * 140}px`,
							}}
						>
							{featuredBooks.map((book, idx) => (
								<div
									key={book.title}
									style={{
										background: "#fff",
										borderRadius: 10,
										boxShadow: "0 2px 12px 0 rgba(31, 38, 135, 0.09)",
										padding: "18px 10px 22px 10px",
										textAlign: "center",
										minWidth: 110,
										minHeight: 160,
										width: 140,
										margin: "0 8px",
										position: "relative",
										transition: "box-shadow 0.2s",
									}}
								>
									<img
										src={book.img}
										alt={book.title}
										style={{
											width: 100,
											height: 140,
											objectFit: "cover",
											borderRadius: 8,
											boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
											marginBottom: 10,
										}}
									/>
									<div
										style={{
											fontWeight: 600,
											fontSize: 13,
											color: "#3a2e1a",
											fontFamily: "'Soria', Georgia, serif",
										}}
									>
										{book.title}
									</div>
									<div
										style={{
											color: "#a08b6b",
											fontSize: 11,
										}}
									>
										{book.author}
									</div>
								</div>
							))}
						</div>
					</div>
					<button
						onClick={handleNext}
						style={{
							position: "absolute",
							right: -20,
							top: "50%",
							transform: "translateY(-50%)",
							background: "#fff",
							border: "1px solid #ccc",
							borderRadius: "50%",
							width: 32,
							height: 32,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							zIndex: 2,
							fontSize: 18,
						}}
						aria-label="Next"
					>
						&#8594;
					</button>
				</div>
			</div>

			{/* Recommended For You */}
			<div
				style={{
					margin: "24px auto 0 auto",
					maxWidth: "80vw",
					width: "80vw",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 16,
					}}
				>
					<div
						style={{
							fontSize: "1.5rem",
							fontWeight: 500,
							color: "#3a2e1a",
						}}
					>
						Recommended For You
					</div>
					<a
						href="#"
						style={{
							color: "#3b4a8b",
							fontWeight: 500,
							textDecoration: "none",
							fontSize: 15,
							cursor: "pointer"
						}}
						onClick={e => {
							e.preventDefault();
							setShowAllBooks(showAllBooks => !showAllBooks);
						}}
					>
						{showAllBooks ? "Close" : "See all"} &rarr;
					</a>
				</div>
				{/* Book Grid */}
				<BookGrid
					books={recommendedBooks}
					showAll={showAllBooks}
					onClose={() => setShowAllBooks(false)}
				/>
			</div>

			{/* Footer */}
			<div
				style={{
					marginTop: 28,
					background: "#f6f7fa",
					borderTop: "1px solid #e0e3ea",
					padding: "24px 0 0 0",
					color: "#2d3652",
					fontFamily: "Segoe UI, Arial, sans-serif",
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						maxWidth: 1100,
						margin: "0 auto",
						padding: "0 3vw",
						display: "flex",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: "min(18px, 3vw)",
						width: "100%",
						boxSizing: "border-box",
						alignItems: "flex-start",
					}}
				>
					<div style={{
						maxWidth: "100%",
						width: "100%",
						minWidth: 0,
						boxSizing: "border-box",
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: "min(18px, 3vw)",
						padding: "0",
					}}>
						{/* Logo and copyright */}
						<div style={{ minWidth: 220, flex: "1 1 220px" }}>
							<img
								src="/vkpublications.png"
								alt="VK Global Group"
								style={{ height: 56, marginBottom: 12 }}
							/>
							<div
								style={{
									fontWeight: 700,
									fontSize: 20,
									marginBottom: 2,
								}}
							>
								VK Global Group
							</div>
							<div
								style={{
									fontSize: 13,
									color: "#444",
									marginBottom: 8,
								}}
							>
								since 1979
							</div>
							<div
								style={{
									fontSize: 13,
									color: "#888",
									marginBottom: 8,
								}}
							>
								Publishing • Packaging • Printing
							</div>
							<div
								style={{
									fontSize: 13,
									color: "#888",
									marginBottom: 8,
								}}
							>
								© Copyright,
								<br />
								<a
									href="https://vkpublications.com/"
									target="_blank"
									rel="noopener noreferrer"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
									}}
								>
									VK Global Publications Pvt. Ltd.
								</a>
								<br />
								{new Date().getFullYear()}
							</div>
						</div>
						{/* About VK Global Group */}
						<div style={{ minWidth: 180, flex: "1 1 180px" }}>
							<div
								style={{ fontWeight: 600, marginBottom: 10 }}
							>
								About VK Global Group
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Packaging
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Printing
								</a>
							</div>
							<div>
								<a
									href="#"
								style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Holographic Films
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Future Kids Publications
								</a>
							</div>
						</div>
						{/* For Learners */}
						<div style={{ minWidth: 140, flex: "1 1 140px" }}>
							<div
								style={{ fontWeight: 600, marginBottom: 10 }}
							>
								For Learners
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Home
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Catalogue
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Resources
								</a>
							</div>
						</div>
						{/* For Educators */}
						<div style={{ minWidth: 160, flex: "1 1 160px" }}>
							<div
								style={{ fontWeight: 600, marginBottom: 10 }}
							>
								For Educators
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Publish with Us
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Sample Request
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Teachers Resources
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Blogs
								</a>
							</div>
						</div>
						{/* The Company */}
						<div style={{ minWidth: 200, flex: "1 1 200px" }}>
							<div
								style={{ fontWeight: 600, marginBottom: 10 }}
							>
								The Company
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Careers
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Cookies
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Privacy Policy
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Terms and Conditions
								</a>
							</div>
							<div>
								<a
									href="#"
									style={{
										color: "#1e3c72",
										textDecoration: "underline",
										fontSize: 15,
									}}
								>
									Orders, Shipping and Refund Policy
								</a>
							</div>
						</div>
						{/* Address */}
						<div style={{ minWidth: 220, flex: "1 1 220px" }}>
							<div
								style={{ fontWeight: 600, marginBottom: 10 }}
							>
								&nbsp;
							</div>
							<div
								style={{
									color: "#222",
									fontSize: 15,
									fontWeight: 500,
									marginBottom: 2,
								}}
							>
								15/1, Main Mathura Road
								<br />
								Sector 31, Faridabad,
								<br />
								Haryana, 121003
							</div>
							<div
								style={{
									color: "#1e3c72",
									fontWeight: 700,
									fontSize: 15,
									marginTop: 8,
								}}
							>
								VK Global Publications Private Limited
							</div>
						</div>
					</div>
				</div>
				<hr
					style={{
						margin: "18px 0 12px 0",
						border: "none",
						borderTop: "1px solid #e0e3ea",
						width: "100%",
						boxSizing: "border-box",
					}}
				/>
				<div
					style={{
						maxWidth: 1100,
						margin: "0 auto",
						padding: "0 3vw 12px 3vw",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "min(12px, 2vw)",
						width: "100%",
						boxSizing: "border-box",
					}}
				>
					{/* Payment and Social */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 48,
							flexWrap: "wrap",
						}}
					>
						<div>
							<div
								style={{
									fontSize: 14,
									color: "#222",
									marginBottom: 6,
								}}
							>
								We accept:
							</div>
							<img
								src="https://cdn.shopify.com/s/files/1/0778/7931/2666/t/9/assets/payment%20(1).jpg?v=1694000428"
								alt="Payment Methods"
								style={{ height: 32 }}
							/>
						</div>
						<div>
							<div
								style={{
									fontSize: 14,
									color: "#222",
									marginBottom: 6,
								}}
							>
								Follow Us:
								{/* Vev Social Buttons */}
								<div id="eUp0fRwDVidc" className="frame frame __wc __c" style={{ display: "flex", gap: 8 }}>
									<a className="__a external-link external-link" href="https://www.instagram.com/vkglobalgroup/" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/qMh_Qmg1Vr.png" width="24" alt="Instagram" />
									</a>
									<a className="__a external-link external-link" href="https://twitter.com/vkglobalgroup" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/bVmS3Ns9Fp.png" width="24" alt="Twitter" />
									</a>
									<a className="__a external-link external-link" href="https://www.facebook.com/vkglobalgroup" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/7mwpwrHh5p.png" width="24" alt="Facebook" />
									</a>
									<a className="__a external-link external-link" href="https://www.youtube.com/@VKGlobalGroup" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/mp0umN_6b2.png" width="24" alt="YouTube" />
									</a>
								</div>
							</div>
						</div>
					</div>
					{/* Subscribe */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							alert("Subscribed!");
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 0,
							flexWrap: "wrap",
						}}
					>
						<div
							style={{
								fontWeight: 500,
								fontSize: 16,
								marginRight: 18,
								marginBottom: 8,
							}}
						>
							Subscribe and
							<br />
							Discover More
						</div>
						<input
							type="email"
							required
							placeholder="E-mail*"
							style={{
								padding: "12px 18px",
								border: "1px solid #ccc",
								borderRadius: "6px 0 0 6px",
								fontSize: 15,
								outline: "none",
								width: 220,
								marginBottom: 8,
							}}
						/>
						<button
							type="submit"
							style={{
								padding: "12px 28px",
								border: "none",
								borderRadius: "0 6px 6px 0",
								background: "#e5e5e5",
								color: "#222",
								fontWeight: 600,
								fontSize: 15,
								cursor: "pointer",
								marginBottom: 8,
							}}
						>
							Subscribe
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}



